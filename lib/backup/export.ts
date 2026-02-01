import { Platform } from "react-native";
import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAllStorageData } from "@/lib/storage/storage";
import { BackupFile } from "./types";

// Web: trigger download
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportBackup(): Promise<void> {
  const data = getAllStorageData();

  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  const content = JSON.stringify(backup, null, 2);
  const filename = `workout-backup-${new Date().toISOString()}.json`;

  if (Platform.OS === "web") {
    // Use browser download
    downloadFile(filename, content);
    return;
  }

  // For native platforms (iOS/Android) using new expo-file-system API
  try {
    const file = new File(Paths.cache, `workout-backup-${Date.now()}.json`);
    await file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType: "application/json" });
  } catch (error) {
    console.error("Native export failed:", error);
    throw error;
  }
}
