/**
 * Database initialization and schema management
 */

import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

let db: SQLiteDatabase | null = null;

/**
 * Get the database instance
 * @throws Error if database not initialized
 */
export function getDatabase(): SQLiteDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Initialize the database connection and create tables
 */
export function initDatabase(): SQLiteDatabase {
  try {
    // Open database connection
    db = openDatabaseSync("workout-app.db");

    // Enable foreign key constraints
    db.execSync("PRAGMA foreign_keys = ON;");

    // Create tables
    createTables(db);

    // Create indexes for performance
    createIndexes(db);

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Create all database tables
 */
function createTables(database: SQLiteDatabase): void {
  // Exercises table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      equipment_required TEXT,
      is_compound INTEGER NOT NULL DEFAULT 0,
      description TEXT
    );
  `);

  // Workout plans table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      weekly_frequency INTEGER NOT NULL CHECK(weekly_frequency >= 2 AND weekly_frequency <= 5),
      duration_weeks INTEGER NOT NULL CHECK(duration_weeks IN (4, 6, 8, 12)),
      estimated_duration_minutes INTEGER,
      created_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Workout session templates table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workout_sessions_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_plan_id INTEGER NOT NULL,
      sequence_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      target_muscle_groups TEXT,
      estimated_duration_minutes INTEGER,
      FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
    );
  `);

  // Session exercise templates table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS session_exercises_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_template_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      exercise_order INTEGER NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      is_warmup INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (session_template_id) REFERENCES workout_sessions_template(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );
  `);

  // Completed workout sessions table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS workout_sessions_completed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_plan_id INTEGER NOT NULL,
      session_template_id INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      notes TEXT,
      FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id),
      FOREIGN KEY (session_template_id) REFERENCES workout_sessions_template(id)
    );
  `);

  // Completed exercise sets table
  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercise_sets_completed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      completed_session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      is_warmup INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (completed_session_id) REFERENCES workout_sessions_completed(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );
  `);
}

/**
 * Create indexes for commonly queried columns
 */
function createIndexes(database: SQLiteDatabase): void {
  // Index on exercises muscle_group for filtering
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group
    ON exercises(muscle_group);
  `);

  // Index on exercises equipment for filtering
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_exercises_equipment
    ON exercises(equipment_required);
  `);

  // Index on exercises is_compound for filtering
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_exercises_compound
    ON exercises(is_compound);
  `);

  // Index on workout_plans is_active for finding active plan
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_workout_plans_active
    ON workout_plans(is_active);
  `);

  // Index on workout_sessions_template workout_plan_id for joins
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_sessions_template_plan
    ON workout_sessions_template(workout_plan_id);
  `);

  // Index on session_exercises_template session_template_id for joins
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_session_exercises_template
    ON session_exercises_template(session_template_id);
  `);

  // Index on workout_sessions_completed for date queries
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_sessions_completed_date
    ON workout_sessions_completed(started_at);
  `);

  // Index on workout_sessions_completed workout_plan_id for filtering
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_sessions_completed_plan
    ON workout_sessions_completed(workout_plan_id);
  `);

  // Index on exercise_sets_completed for history queries
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_sets_completed_session
    ON exercise_sets_completed(completed_session_id);
  `);

  // Index on exercise_sets_completed exercise_id for progress tracking
  database.execSync(`
    CREATE INDEX IF NOT EXISTS idx_sets_completed_exercise
    ON exercise_sets_completed(exercise_id);
  `);
}

/**
 * Reset the database by dropping and recreating all tables
 * WARNING: This will delete all data!
 */
export function resetDatabase(): void {
  const database = getDatabase();

  try {
    // Drop tables in reverse order of dependencies
    database.execSync("DROP TABLE IF EXISTS exercise_sets_completed;");
    database.execSync("DROP TABLE IF EXISTS workout_sessions_completed;");
    database.execSync("DROP TABLE IF EXISTS session_exercises_template;");
    database.execSync("DROP TABLE IF EXISTS workout_sessions_template;");
    database.execSync("DROP TABLE IF EXISTS workout_plans;");
    database.execSync("DROP TABLE IF EXISTS exercises;");

    // Recreate tables
    createTables(database);
    createIndexes(database);

    console.log("Database reset successfully");
  } catch (error) {
    console.error("Failed to reset database:", error);
    throw error;
  }
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    // Note: expo-sqlite doesn't have an explicit close method in newer versions
    // The connection is managed automatically
    db = null;
    console.log("Database connection closed");
  }
}
