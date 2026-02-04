import { Platform } from "react-native";
import { File } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { BackupFile, ValidationError } from "./types";
import { replaceAllStorageData } from "@/lib/storage/storage";

function validateBackup(obj: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!obj || typeof obj !== "object") {
    errors.push({ field: "root", message: "Backup is not a valid object" });
    return errors;
  }
  if (typeof obj.version !== "number") errors.push({ field: "version", message: "Missing version" });
  if (typeof obj.exportedAt !== "string") errors.push({ field: "exportedAt", message: "Missing exportedAt" });
  if (!obj.data || typeof obj.data !== "object") errors.push({ field: "data", message: "Missing data" });
  else {
    const d = obj.data;
    const expected = [
      "exercises",
      "workoutPlans",
      "sessionTemplates",
      "exerciseTemplates",
      "completedSessions",
      "completedSets",
      "idCounters",
    ];
    expected.forEach((k) => {
      if (!(k in d)) errors.push({ field: `data.${k}`, message: `Missing ${k}` });
    });
  }
  return errors;
}

async function pickFileOnWeb(): Promise<string> {
  return await new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    
    // Add input to DOM temporarily (helps with iOS compatibility)
    input.style.display = "none";
    document.body.appendChild(input);
    
    let isResolved = false;
    let changeEventFired = false;
    
    // Handle file selection
    input.onchange = async (e) => {
      console.log("File input onchange fired", e);
      changeEventFired = true;
      
      if (isResolved) {
        console.log("Already resolved, skipping");
        return;
      }
      
      // Small delay to ensure file is fully available (iOS Safari quirk)
      await new Promise(r => setTimeout(r, 100));
      
      const file = input.files?.[0];
      console.log("Selected file:", file?.name, "size:", file?.size, "type:", file?.type);
      
      if (!file) {
        console.error("No file in input.files");
        isResolved = true;
        document.body.removeChild(input);
        return reject(new Error("No file selected"));
      }
      
      try {
        console.log("Reading file as text...");
        const text = await file.text();
        console.log("File read successfully, content length:", text.length, "first 100 chars:", text.substring(0, 100));
        isResolved = true;
        document.body.removeChild(input);
        resolve(text);
      } catch (err) {
        console.error("Error reading file:", err);
        isResolved = true;
        document.body.removeChild(input);
        reject(err);
      }
    };
    
    // Handle explicit cancellation (works on modern browsers)
    input.oncancel = () => {
      console.log("File input oncancel fired");
      if (isResolved) return;
      isResolved = true;
      document.body.removeChild(input);
      reject(new Error("File selection cancelled"));
    };
    
    // Fallback cancellation detection for browsers that don't support oncancel
    // Use a longer delay and only reject if onchange never fired
    const checkForCancellation = () => {
      setTimeout(() => {
        console.log("Checking for cancellation - changeEventFired:", changeEventFired, "isResolved:", isResolved);
        if (!changeEventFired && !isResolved) {
          console.log("No change event after 3 seconds, assuming cancelled");
          isResolved = true;
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
          reject(new Error("File selection cancelled"));
        }
      }, 3000); // 3 second timeout - generous for slow mobile connections
    };
    
    // Set up cancellation check
    // On iOS, we need to wait for a "change" or user interaction
    // The blur event on window can help detect when user dismisses the picker
    const handleBlur = () => {
      console.log("Window blur event");
      // When window loses focus, file picker is open
      // When it regains focus, picker was closed
      window.addEventListener("focus", () => {
        console.log("Window focus event after blur");
        checkForCancellation();
      }, { once: true });
    };
    
    window.addEventListener("blur", handleBlur, { once: true });
    
    console.log("Opening file picker...");
    input.click();
  });
}

export async function importBackup(): Promise<BackupFile> {
  try {
    console.log("Starting import, Platform.OS:", Platform.OS);
    let content: string;
    if (Platform.OS === "web") {
      console.log("Using web file picker");
      content = await pickFileOnWeb();
      console.log("File picked successfully, content length:", content.length);
    } else {
      // Native - use document picker and new File API
      const res = await DocumentPicker.getDocumentAsync({ type: "application/json" });
      if (res.canceled || !res.assets || res.assets.length === 0) {
        throw new Error("No file selected");
      }
      const fileUri = res.assets[0].uri;
      const file = new File(fileUri);
      content = await file.text();
    }

    console.log("Parsing JSON...");
    const parsed = JSON.parse(content);
    console.log("JSON parsed successfully, validating...");
    
    const errors = validateBackup(parsed);
    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      throw new Error(`Backup validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`);
    }

    console.log("Validation passed, replacing storage data...");
    console.log("Data to import:", {
      exercises: parsed.data.exercises.length,
      workoutPlans: parsed.data.workoutPlans.length,
      completedSessions: parsed.data.completedSessions.length,
    });
    
    // Replace storage
    await replaceAllStorageData(parsed.data);
    console.log("Storage replaced successfully");

    return parsed as BackupFile;
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
}
