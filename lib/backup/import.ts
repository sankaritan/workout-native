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
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error("No file selected"));
      try {
        const text = await file.text();
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}

export async function importBackup(): Promise<BackupFile> {
  try {
    let content: string;
    if (Platform.OS === "web") {
      content = await pickFileOnWeb();
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

    const parsed = JSON.parse(content);
    const errors = validateBackup(parsed);
    if (errors.length > 0) {
      throw new Error(`Backup validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`);
    }

    // Replace storage
    await replaceAllStorageData(parsed.data);

    return parsed as BackupFile;
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
}
