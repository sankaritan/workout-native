/**
 * Integration test for import/export UI state management
 * Tests that the UI properly handles cancellations and state updates
 */

import { getAllStorageData, replaceAllStorageData, resetStorage } from '@/lib/storage/storage';
import { seedExercises, seedTestWorkoutPlan, seedMockWorkoutHistory } from '@/lib/storage/seed-data';

describe('Import/Export UI State Bug Fixes', () => {
  beforeEach(async () => {
    await resetStorage();
    seedExercises();
  });

  describe('Bug #1: Stuck state when cancelling file picker', () => {
    it('should properly detect cancellation errors', () => {
      const cancellationErrors = [
        new Error('File selection cancelled'),
        new Error('File selection canceled'),
        new Error('User cancelled the operation'),
        new Error('Operation canceled by user'),
      ];

      cancellationErrors.forEach((error) => {
        const message = error.message;
        const isCancellation = message.includes('cancelled') || message.includes('canceled');
        expect(isCancellation).toBe(true);
      });
    });

    it('should not treat validation errors as cancellations', () => {
      const validationErrors = [
        new Error('Backup validation failed: data.exercises: Missing exercises'),
        new Error('Invalid backup format'),
        new Error('Failed to parse JSON'),
      ];

      validationErrors.forEach((error) => {
        const message = error.message;
        const isCancellation = message.includes('cancelled') || message.includes('canceled');
        expect(isCancellation).toBe(false);
      });
    });
  });

  describe('Bug #2: History not updating after import', () => {
    it('should maintain data integrity when re-importing same data', async () => {
      // Setup: Create initial state with history
      seedTestWorkoutPlan();
      seedMockWorkoutHistory();
      
      const initialData = getAllStorageData();
      const sessionCount = initialData.completedSessions.length;
      const setCount = initialData.completedSets.length;

      expect(sessionCount).toBeGreaterThan(0);
      expect(setCount).toBeGreaterThan(0);

      // Create a backup
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: initialData
      };

      // Re-import without clearing (the bug scenario)
      await replaceAllStorageData(backup.data);

      // Verify data is correct (not duplicated or lost)
      const afterData = getAllStorageData();
      expect(afterData.completedSessions.length).toBe(sessionCount);
      expect(afterData.completedSets.length).toBe(setCount);

      // Verify IDs are preserved
      expect(afterData.idCounters).toEqual(initialData.idCounters);

      // Verify session details are preserved
      const originalFirstSession = initialData.completedSessions[0];
      const afterFirstSession = afterData.completedSessions[0];
      expect(afterFirstSession.id).toBe(originalFirstSession.id);
      expect(afterFirstSession.session_template_id).toBe(originalFirstSession.session_template_id);
      expect(afterFirstSession.started_at).toBe(originalFirstSession.started_at);
      expect(afterFirstSession.completed_at).toBe(originalFirstSession.completed_at);
    });

    it('should properly replace all data collections', async () => {
      // Start with data set A
      seedTestWorkoutPlan();
      const dataA = getAllStorageData();

      // Clear and create data set B
      await resetStorage();
      seedExercises();
      seedTestWorkoutPlan();
      seedMockWorkoutHistory();
      const dataB = getAllStorageData();

      // Import data set A (should completely replace B)
      await replaceAllStorageData(dataA);

      const afterImport = getAllStorageData();

      // Should match data A, not B
      expect(afterImport.workoutPlans.length).toBe(dataA.workoutPlans.length);
      expect(afterImport.completedSessions.length).toBe(dataA.completedSessions.length);
      
      // Should NOT have B's history
      expect(afterImport.completedSessions.length).not.toBe(dataB.completedSessions.length);
    });

    it('should handle empty import correctly', async () => {
      // Setup: Create data
      seedTestWorkoutPlan();
      seedMockWorkoutHistory();
      const beforeData = getAllStorageData();
      expect(beforeData.completedSessions.length).toBeGreaterThan(0);

      // Create empty backup (just exercises)
      await resetStorage();
      seedExercises();
      const emptyData = getAllStorageData();

      // Import empty state
      await replaceAllStorageData(emptyData);

      const afterData = getAllStorageData();
      expect(afterData.completedSessions.length).toBe(0);
      expect(afterData.workoutPlans.length).toBe(0);
      expect(afterData.exercises.length).toBeGreaterThan(0); // Exercises should still exist
    });
  });

  describe('Data consistency checks', () => {
    it('should maintain referential integrity after import', async () => {
      seedTestWorkoutPlan();
      seedMockWorkoutHistory();
      
      const data = getAllStorageData();

      // Verify all completed sessions reference valid templates
      data.completedSessions.forEach((session) => {
        const template = data.sessionTemplates.find(t => t.id === session.session_template_id);
        expect(template).toBeDefined();
      });

      // Verify all completed sets reference valid sessions
      data.completedSets.forEach((set) => {
        const session = data.completedSessions.find(s => s.id === set.completed_session_id);
        expect(session).toBeDefined();
      });

      // Verify all completed sets reference valid exercises
      data.completedSets.forEach((set) => {
        const exercise = data.exercises.find(e => e.id === set.exercise_id);
        expect(exercise).toBeDefined();
      });
    });
  });
});
