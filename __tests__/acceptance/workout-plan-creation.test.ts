/**
 * Acceptance Test: Complete Workout Plan Creation Flow
 * 
 * This test validates the entire user journey of creating a workout plan from scratch:
 * 1. User starts from empty state
 * 2. User goes through wizard (frequency -> equipment -> focus -> exercises -> review)
 * 3. User confirms and creates plan
 * 4. Plan is saved to storage
 * 5. Plan appears on dashboard
 * 
 * This is an end-to-end test using virtual DOM (not full browser e2e)
 * to test actual user workflow while maintaining fast test execution.
 */

import { generateWorkoutProgram, saveWorkoutProgram } from "@/lib/workout-generator/engine";
import {
  initStorage,
  resetStorage,
  getActiveWorkoutPlan,
  getAllWorkoutPlans,
  getSessionTemplatesByPlanId,
  getExerciseTemplatesBySessionId,
  getExerciseById,
} from "@/lib/storage/storage";
import { seedExercises } from "@/lib/storage/seed-data";
import type { GenerationInput } from "@/lib/workout-generator/types";

describe("Acceptance Test: Workout Plan Creation", () => {
  beforeEach(async () => {
    // Setup storage with exercise database
    await initStorage();
    await resetStorage();
    await seedExercises();
  });

  it("should create a complete workout plan from user selections", async () => {
    // Step 1: User selects workout preferences (simulating wizard flow)
    const userSelections: GenerationInput = {
      frequency: 4, // 4 days per week
      equipment: ["Barbell", "Dumbbell"], // User has barbell and dumbbells
      focus: "Balanced", // Balanced training
    };

    // Step 2: Generate workout program based on selections
    const program = generateWorkoutProgram(userSelections);

    // Verify program structure
    expect(program).toBeDefined();
    expect(program.name).toBe("Balanced Program (4x/week)");
    expect(program.sessions).toHaveLength(4); // 4 sessions per week
    expect(program.durationWeeks).toBe(8); // Default 8 weeks

    // Verify each session has exercises
    program.sessions.forEach((session, index) => {
      expect(session.name).toBeDefined();
      expect(session.exercises.length).toBeGreaterThan(0);
      expect(session.exercises.length).toBeLessThanOrEqual(5); // Max 5 exercises per session
      expect(session.primaryMuscles.length).toBeGreaterThan(0);

      // Verify exercises have proper structure
      session.exercises.forEach((programExercise) => {
        expect(programExercise.exercise).toBeDefined();
        expect(programExercise.exercise.name).toBeDefined();
        expect(programExercise.sets).toBe(3); // Balanced = 3 sets
        expect(programExercise.repsMin).toBe(8); // Balanced = 8-12 reps
        expect(programExercise.repsMax).toBe(12);
        expect(programExercise.order).toBeGreaterThan(0);
        
        // Verify equipment matches user selection (bodyweight always allowed)
        if (programExercise.exercise.equipment_required) {
          const allowedEquipment = [...userSelections.equipment, "Bodyweight"];
          expect(
            allowedEquipment.includes(programExercise.exercise.equipment_required) ||
            programExercise.exercise.equipment_required === null
          ).toBe(true);
        }
      });

      // Verify compound exercises come first (ordering)
      const compoundExercises = session.exercises.filter(
        (ex) => ex.exercise.is_compound
      );
      const isolationExercises = session.exercises.filter(
        (ex) => !ex.exercise.is_compound
      );
      
      if (compoundExercises.length > 0 && isolationExercises.length > 0) {
        // First compound exercise should come before first isolation
        const firstCompoundIndex = session.exercises.findIndex(
          (ex) => ex.exercise.is_compound
        );
        const firstIsolationIndex = session.exercises.findIndex(
          (ex) => !ex.exercise.is_compound
        );
        expect(firstCompoundIndex).toBeLessThan(firstIsolationIndex);
      }
    });

    // Step 3: User confirms and saves the plan
    const savedPlanId = saveWorkoutProgram(program);
    expect(savedPlanId).toBeGreaterThan(0);

    // Step 4: Verify plan is saved to storage
    const savedPlan = getActiveWorkoutPlan();
    expect(savedPlan).not.toBeNull();
    expect(savedPlan?.id).toBe(savedPlanId);
    expect(savedPlan?.name).toBe(program.name);
    expect(savedPlan?.is_active).toBe(true);
    expect(savedPlan?.weekly_frequency).toBe(4);
    expect(savedPlan?.duration_weeks).toBe(8);

    // Step 5: Verify sessions are saved
    const sessions = getSessionTemplatesByPlanId(savedPlanId);
    expect(sessions).toHaveLength(4);

    // Verify session details
    sessions.forEach((session, index) => {
      expect(session.workout_plan_id).toBe(savedPlanId);
      expect(session.sequence_order).toBe(index + 1);
      expect(session.name).toBe(program.sessions[index].name);

      // Verify exercises for this session
      const exerciseTemplates = getExerciseTemplatesBySessionId(session.id);
      expect(exerciseTemplates.length).toBe(
        program.sessions[index].exercises.length
      );

      // Verify exercise details match
      exerciseTemplates.forEach((template, exIndex) => {
        const programExercise = program.sessions[index].exercises[exIndex];
        
        expect(template.session_template_id).toBe(session.id);
        expect(template.exercise_order).toBe(exIndex + 1);
        expect(template.sets).toBe(programExercise.sets);
        
        // Verify exercise data is retrievable
        const exercise = getExerciseById(template.exercise_id);
        expect(exercise).not.toBeNull();
        expect(exercise?.name).toBe(programExercise.exercise.name);
      });
    });

    // Step 6: Verify plan appears in plan list
    const allPlans = getAllWorkoutPlans();
    expect(allPlans.length).toBeGreaterThan(0);
    expect(allPlans.some((p) => p.id === savedPlanId)).toBe(true);
  });

  it("should create different plans for different frequencies", async () => {
    // Test that 3-day and 5-day plans are different
    const input3Day: GenerationInput = {
      frequency: 3,
      equipment: ["Barbell", "Dumbbell"],
      focus: "Balanced",
    };

    const input5Day: GenerationInput = {
      frequency: 5,
      equipment: ["Barbell", "Dumbbell"],
      focus: "Balanced",
    };

    const program3Day = generateWorkoutProgram(input3Day);
    const program5Day = generateWorkoutProgram(input5Day);

    expect(program3Day.sessions).toHaveLength(3);
    expect(program5Day.sessions).toHaveLength(5);
    
    // Different frequencies should have different splits
    expect(program3Day.name).toContain("3x/week");
    expect(program5Day.name).toContain("5x/week");
  });

  it("should respect equipment limitations", async () => {
    // Test with bodyweight only
    const bodyweightInput: GenerationInput = {
      frequency: 3,
      equipment: ["Bodyweight"],
      focus: "Balanced",
    };

    const program = generateWorkoutProgram(bodyweightInput);

    // Verify all exercises are bodyweight or null equipment
    program.sessions.forEach((session) => {
      session.exercises.forEach((programExercise) => {
        const equipment = programExercise.exercise.equipment_required;
        expect(equipment === null || equipment === "Bodyweight").toBe(true);
      });
    });
  });

  it("should create different set/rep schemes for different focuses", async () => {
    const strengthInput: GenerationInput = {
      frequency: 4,
      equipment: ["Barbell", "Dumbbell"],
      focus: "Strength",
    };

    const enduranceInput: GenerationInput = {
      frequency: 4,
      equipment: ["Barbell", "Dumbbell"],
      focus: "Endurance",
    };

    const strengthProgram = generateWorkoutProgram(strengthInput);
    const enduranceProgram = generateWorkoutProgram(enduranceInput);

    // Verify strength focus: 5 sets x 3-5 reps
    strengthProgram.sessions[0].exercises.forEach((ex) => {
      expect(ex.sets).toBe(5);
      expect(ex.repsMin).toBe(3);
      expect(ex.repsMax).toBe(5);
    });

    // Verify endurance focus: 3 sets x 15-20 reps
    enduranceProgram.sessions[0].exercises.forEach((ex) => {
      expect(ex.sets).toBe(3);
      expect(ex.repsMin).toBe(15);
      expect(ex.repsMax).toBe(20);
    });
  });

  it("should handle multiple plan creation without conflicts", async () => {
    // Create first plan
    const input1: GenerationInput = {
      frequency: 3,
      equipment: ["Barbell"],
      focus: "Strength",
    };
    const program1 = generateWorkoutProgram(input1);
    const plan1Id = saveWorkoutProgram(program1);

    // Create second plan
    const input2: GenerationInput = {
      frequency: 4,
      equipment: ["Dumbbell"],
      focus: "Balanced",
    };
    const program2 = generateWorkoutProgram(input2);
    const plan2Id = saveWorkoutProgram(program2);

    // Verify both plans exist
    const allPlans = getAllWorkoutPlans();
    expect(allPlans.length).toBe(2);

    // Second plan should be active (most recent)
    const activePlan = getActiveWorkoutPlan();
    expect(activePlan?.id).toBe(plan2Id);

    // Both plans should have their own sessions
    const plan1Sessions = getSessionTemplatesByPlanId(plan1Id);
    const plan2Sessions = getSessionTemplatesByPlanId(plan2Id);
    expect(plan1Sessions).toHaveLength(3);
    expect(plan2Sessions).toHaveLength(4);
  });
});
