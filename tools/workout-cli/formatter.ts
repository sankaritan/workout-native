import type { Exercise } from "../../lib/storage/types";
import { EXERCISE_PRIORITY_LABELS } from "../../lib/storage/types";
import type { ProgramSession } from "./algorithm/types";
import type {
  AssignmentReason,
  OrderingReason,
} from "./algorithm/day-splitter";
import type { SelectionReason } from "./algorithm/exercise-selector";

const COLUMN_SEPARATOR = " │ ";

function pad(value: string, width: number): string {
  if (value.length >= width) return value.slice(0, width);
  return value + " ".repeat(width - value.length);
}

function buildRow(cells: string[], widths: number[]): string {
  const padded = cells.map((cell, idx) => pad(cell, widths[idx]));
  return padded.join(COLUMN_SEPARATOR);
}

function buildDivider(widths: number[]): string {
  return widths.map((width) => "─".repeat(width)).join("─┼─");
}

function printSection(title: string): void {
  const line = "═".repeat(Math.max(12, title.length + 4));
  console.log(line);
  console.log(` ${title} `);
  console.log(line);
}

export function printSelectionTable(
  reasons: SelectionReason[],
  totalAvailable: number,
  relevantMuscles: string[]
): void {
  printSection("INITIAL EXERCISE SELECTION");
  console.log(`Available after equipment filter: ${totalAvailable}`);
  console.log(`Relevant muscles: ${relevantMuscles.join(", ") || "None"}`);
  console.log("");

  const headers = ["#", "Exercise", "Primary", "Equipment", "Tier", "Why Selected"];
  const widths = [3, 28, 10, 12, 10, 40];

  console.log(buildRow(headers, widths));
  console.log(buildDivider(widths));

  reasons.forEach((reason, index) => {
    const cells = [
      String(index + 1),
      reason.exerciseName,
      reason.primaryMuscle,
      reason.equipment ?? "Bodyweight",
      EXERCISE_PRIORITY_LABELS[reason.priority],
      reason.reason,
    ];
    console.log(buildRow(cells, widths));
  });

  console.log("");
}

export function printSelectionVerbose(
  muscleBreakdown: Array<{
    muscle: string;
    candidateCount: number;
    selectedNames: string[];
  }>
): void {
  printSection("SELECTION DETAILS");
  muscleBreakdown.forEach((entry) => {
    console.log(`${entry.muscle}: ${entry.candidateCount} candidates`);
    if (entry.selectedNames.length > 0) {
      console.log(`  Selected: ${entry.selectedNames.join(", ")}`);
    } else {
      console.log("  Selected: none");
    }
  });
  console.log("");
}

export function printPlanTable(
  assignments: AssignmentReason[],
  ordering: OrderingReason[],
  sessions: ProgramSession[]
): void {
  printSection("PLAN GENERATION");
  const orderingMap = new Map<number, OrderingReason[]>();

  ordering.forEach((order) => {
    if (!orderingMap.has(order.exerciseId)) {
      orderingMap.set(order.exerciseId, []);
    }
    orderingMap.get(order.exerciseId)?.push(order);
  });

  const headers = [
    "Exercise",
    "Primary",
    "Assigned To",
    "Order",
    "Why This Day",
    "Why This Order",
  ];
  const widths = [26, 10, 16, 5, 30, 28];

  console.log(buildRow(headers, widths));
  console.log(buildDivider(widths));

  assignments.forEach((assignment) => {
    const orderInfo = orderingMap
      .get(assignment.exerciseId)
      ?.find((item) => item.sessionIndex === assignment.assignedSessionIndex);

    const cells = [
      assignment.exerciseName,
      assignment.primaryMuscle,
      assignment.assignedSessionName,
      orderInfo ? String(orderInfo.order) : "-",
      `[${assignment.pass}] ${assignment.reason}`,
      orderInfo?.reason ?? "-",
    ];
    console.log(buildRow(cells, widths));
  });

  console.log("");

  printSection("DAY SUMMARY");
  sessions.forEach((session) => {
    console.log(`${session.name} (Day ${session.dayOfWeek})`);
    session.exercises
      .sort((a, b) => a.order - b.order)
      .forEach((exercise) => {
        console.log(`  ${exercise.order}. ${exercise.exercise.name}`);
      });
    console.log("");
  });
}

export function printPlanVerbose(assignments: AssignmentReason[]): void {
  printSection("ASSIGNMENT DETAILS");
  const grouped = new Map<string, AssignmentReason[]>();

  assignments.forEach((assignment) => {
    if (!grouped.has(assignment.pass)) {
      grouped.set(assignment.pass, []);
    }
    grouped.get(assignment.pass)?.push(assignment);
  });

  const order: Array<AssignmentReason["pass"]> = [
    "primary",
    "secondary",
    "rebalance",
    "minimum",
  ];

  order.forEach((pass) => {
    const list = grouped.get(pass) ?? [];
    if (list.length === 0) return;
    console.log(pass.toUpperCase());
    list.forEach((assignment) => {
      console.log(
        `  ${assignment.exerciseName} -> ${assignment.assignedSessionName} (${assignment.reason})`
      );
    });
  });
  console.log("");
}

export function printAvailableExercises(exercises: Exercise[]): void {
  printSection("AVAILABLE EXERCISES");
  const widths = [28, 10, 12, 10];
  const headers = ["Exercise", "Primary", "Equipment", "Tier"];
  console.log(buildRow(headers, widths));
  console.log(buildDivider(widths));

  exercises.forEach((exercise) => {
    const cells = [
      exercise.name,
      exercise.muscle_groups[0],
      exercise.equipment_required ?? "Bodyweight",
      EXERCISE_PRIORITY_LABELS[exercise.priority],
    ];
    console.log(buildRow(cells, widths));
  });
  console.log("");
}
