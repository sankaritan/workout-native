# Workout CLI (Experimental)

Interactive CLI for iterating on workout generation without touching the app UI.

## Run

From the repo root (requires `tsx`):

```bash
npx tsx tools/workout-cli/cli.ts --frequency=4 --focus=Balanced --equipment=Barbell,Dumbbell
```

If you omit arguments, defaults are:

- frequency: 3
- focus: Balanced
- equipment: Bodyweight

## Install tsx (one time)

```bash
npm install -D tsx
```

## Interactive Commands

- `remove <#>` remove exercise by index
- `remove <name>` remove exercise by name
- `add <name>` add exercise by name
- `list` show current selection
- `available` list all exercises matching equipment
- `done` generate plan from current list
- `regenerate` re-run selection using current inputs
- `set frequency <n>` update frequency and re-run selection
- `set equipment <a,b,c>` update equipment and re-run selection
- `set focus <Balanced|Strength|Endurance>` update focus and re-run selection
- `help` show commands
- `exit` quit

## Notes

- The CLI uses its own algorithm copies under `tools/workout-cli/algorithm/`.
- Exercise database is shared from `lib/storage/seed-data.ts`.
