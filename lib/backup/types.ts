// Backup file types
export interface IdCounters {
  exercises: number;
  workoutPlans: number;
  sessionTemplates: number;
  exerciseTemplates: number;
  completedSessions: number;
  completedSets: number;
}

export interface BackupData {
  exercises: any[];
  workoutPlans: any[];
  sessionTemplates: any[];
  exerciseTemplates: any[];
  completedSessions: any[];
  completedSets: any[];
  idCounters: IdCounters;
}

export interface BackupFile {
  version: number;
  exportedAt: string; // ISO timestamp
  data: BackupData;
}

export interface ValidationError {
  field: string;
  message: string;
}
