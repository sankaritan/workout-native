import readline from "node:readline";
import { EXERCISES } from "../../lib/storage/seed-data";
import type { Exercise, Equipment } from "../../lib/storage/types";
import { filterExercisesByEquipment } from "./algorithm/exercise-selector";
import { selectInitialExercises } from "./algorithm/exercise-selector";
import { generateWorkoutProgramFromCustomExercises } from "./algorithm/day-splitter";
import type { GenerationInput } from "./algorithm/types";
import {
  printSelectionTable,
  printPlanTable,
  printAvailableExercises,
} from "./formatter";

type Focus = "Balanced" | "Strength" | "Endurance";

interface CliState {
  input: GenerationInput;
  selectedExercises: Exercise[];
}

function parseArgs(): { input: GenerationInput } {
  const args = process.argv.slice(2);
  const argMap = new Map<string, string>();

  args.forEach((arg) => {
    if (!arg.startsWith("--")) return;
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key && value !== undefined) {
      argMap.set(key, value);
    }
  });

  const frequency = Number(argMap.get("frequency") ?? "3");
  const focus = (argMap.get("focus") ?? "Balanced") as Focus;
  const equipmentRaw = argMap.get("equipment") ?? "Bodyweight";
  const equipment = equipmentRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as Equipment[];

  return {
    input: {
      frequency,
      focus,
      equipment,
    },
  };
}

function buildExerciseCatalog(): Exercise[] {
  return EXERCISES.map((exercise, index) => ({
    id: index + 1,
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    muscle_groups: exercise.muscle_groups,
    equipment_required: exercise.equipment_required,
    is_compound: exercise.is_compound,
    description: exercise.description ?? null,
  }));
}

function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase();
}

function findExerciseByName(exercises: Exercise[], name: string): Exercise | undefined {
  const normalized = normalizeExerciseName(name);
  return exercises.find((exercise) => normalizeExerciseName(exercise.name) === normalized);
}

function parseListInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function runSelection(state: CliState, catalog: Exercise[]): void {
  const { selected, diagnostics } = selectInitialExercises(
    catalog,
    state.input.equipment,
    state.input.frequency
  );
  state.selectedExercises = selected;
  printSelectionTable(
    diagnostics.reasons,
    diagnostics.filteredByEquipment,
    diagnostics.relevantMuscles
  );
}

function generatePlan(state: CliState): void {
  const { program, diagnostics } = generateWorkoutProgramFromCustomExercises(
    state.input,
    state.selectedExercises
  );

  printPlanTable(diagnostics.assignments, diagnostics.ordering, program.sessions);

  if (diagnostics.unassigned.length > 0) {
    console.log("Unassigned exercises:");
    diagnostics.unassigned.forEach((exercise) => console.log(`- ${exercise.name}`));
    console.log("");
  }
}

function printHelp(): void {
  console.log("Commands:");
  console.log("  remove <#>          Remove exercise by number");
  console.log("  remove <name>       Remove exercise by name");
  console.log("  add <name>          Add exercise by name");
  console.log("  list                Show current selected exercises");
  console.log("  available           Show all exercises matching equipment");
  console.log("  done                Generate plan from current list");
  console.log("  regenerate          Re-run selection with current inputs");
  console.log("  set frequency <n>   Change frequency and re-run selection");
  console.log("  set equipment <x>   Change equipment and re-run selection");
  console.log("  set focus <x>       Change focus (Balanced|Strength|Endurance)");
  console.log("  help                Show commands");
  console.log("  exit                Quit");
  console.log("");
}

function formatExerciseList(exercises: Exercise[]): void {
  exercises.forEach((exercise, index) => {
    console.log(
      `${index + 1}. ${exercise.name} (${exercise.muscle_groups[0]}, ${
        exercise.is_compound ? "Compound" : "Isolation"
      })`
    );
  });
  console.log("");
}

async function startInteractive(state: CliState, catalog: Exercise[]): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Type 'help' for commands.\n");
  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      continue;
    }

    const [command, ...rest] = input.split(" ");
    const args = rest.join(" ").trim();

    switch (command.toLowerCase()) {
      case "remove": {
        if (!args) {
          console.log("Provide an exercise number or name.");
          break;
        }
        const index = Number(args);
        if (!Number.isNaN(index) && index > 0) {
          const removed = state.selectedExercises.splice(index - 1, 1)[0];
          if (removed) {
            console.log(`Removed: ${removed.name}`);
          } else {
            console.log("No exercise at that index.");
          }
        } else {
          const exercise = findExerciseByName(state.selectedExercises, args);
          if (exercise) {
            state.selectedExercises = state.selectedExercises.filter(
              (ex) => ex.id !== exercise.id
            );
            console.log(`Removed: ${exercise.name}`);
          } else {
            console.log("Exercise not found in current list.");
          }
        }
        break;
      }
      case "add": {
        if (!args) {
          console.log("Provide an exercise name.");
          break;
        }
        const exercise = findExerciseByName(catalog, args);
        if (!exercise) {
          console.log("Exercise not found in catalog.");
          break;
        }
        if (state.selectedExercises.some((ex) => ex.id === exercise.id)) {
          console.log("Exercise already in list.");
          break;
        }
        state.selectedExercises.push(exercise);
        console.log(`Added: ${exercise.name}`);
        break;
      }
      case "list": {
        formatExerciseList(state.selectedExercises);
        break;
      }
      case "available": {
        const available = filterExercisesByEquipment(
          catalog,
          state.input.equipment
        );
        console.log(`Available exercises: ${available.length}`);
        if (available.length === 0) {
          console.log("No exercises available for current equipment.");
        }
        printAvailableExercises(available);
        break;
      }
      case "done": {
        generatePlan(state);
        break;
      }
      case "regenerate": {
        runSelection(state, catalog);
        break;
      }
      case "set": {
        const [field, ...valueParts] = args.split(" ");
        const value = valueParts.join(" ").trim();
        if (!field || !value) {
          console.log("Usage: set frequency <n> | set equipment <a,b> | set focus <type>");
          break;
        }
        if (field === "frequency") {
          const frequency = Number(value);
          if (!Number.isNaN(frequency) && frequency > 0) {
            state.input.frequency = frequency;
            runSelection(state, catalog);
          } else {
            console.log("Frequency must be a number.");
          }
        } else if (field === "equipment") {
          const equipment = parseListInput(value) as Equipment[];
          state.input.equipment = equipment.length > 0 ? equipment : ["Bodyweight"];
          runSelection(state, catalog);
        } else if (field === "focus") {
          const focus = value as Focus;
          if (focus === "Balanced" || focus === "Strength" || focus === "Endurance") {
            state.input.focus = focus;
            runSelection(state, catalog);
          } else {
            console.log("Focus must be Balanced, Strength, or Endurance.");
          }
        } else {
          console.log("Unknown field. Use frequency, equipment, or focus.");
        }
        break;
      }
      case "help": {
        printHelp();
        break;
      }
      case "exit": {
        rl.close();
        return;
      }
      default: {
        console.log("Unknown command. Type 'help' for commands.");
        break;
      }
    }

    rl.prompt();
  }
}

async function main(): Promise<void> {
  const { input } = parseArgs();
  const catalog = buildExerciseCatalog();

  const state: CliState = {
    input,
    selectedExercises: [],
  };

  console.log(`Frequency: ${input.frequency} days`);
  console.log(`Focus: ${input.focus}`);
  console.log(`Equipment: ${input.equipment.join(", ")}`);
  console.log("");

  runSelection(state, catalog);
  await startInteractive(state, catalog);
}

main().catch((error) => {
  console.error("Failed to run workout CLI:", error);
  process.exit(1);
});
