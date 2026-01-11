# Workout App - Incremental Implementation Plan

## Overview

Build a fitness/workout planning and tracking application with three main feature areas:

1. **Designing Workout** - Wizard-based workout plan generation
2. **Tracking Workout** - Real-time set/rep/weight logging during sessions
3. **Reviewing History** - Calendar view and exercise progress charts

**Implementation Strategy**: Incremental user stories that each deliver independently testable, usable, verifiable functionality. Build from foundation → core value → enhancements.

**Key Constraints**:

- Start with simple rule-based workout generation
- Pre-populated exercise database only (no custom exercises)
- Simple line charts for exercise trends
- Design mockups available for 8 screens in `design-assets/stitch_workout_frequency_selection/`

## Database Schema

### Core Tables

**exercises**

```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL)
- muscle_group (TEXT NOT NULL) -- Chest, Back, Legs, Shoulders, Arms, Core
- equipment_required (TEXT) -- Barbell, Dumbbell, Bodyweight, etc.
- is_compound (BOOLEAN NOT NULL)
- description (TEXT)
```

**workout_plans**

```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL)
- description (TEXT)
- weekly_frequency (INTEGER NOT NULL) -- 2-5 sessions per week
- duration_weeks (INTEGER NOT NULL) -- 4, 6, 8, or 12
- estimated_duration_minutes (INTEGER)
- created_at (DATETIME NOT NULL)
- is_active (BOOLEAN DEFAULT 1)
```

**workout_sessions_template**

```sql
- id (INTEGER PRIMARY KEY)
- workout_plan_id (INTEGER FOREIGN KEY)
- sequence_order (INTEGER NOT NULL)
- name (TEXT NOT NULL)
- target_muscle_groups (TEXT) -- JSON array
- estimated_duration_minutes (INTEGER)
```

**session_exercises_template**

```sql
- id (INTEGER PRIMARY KEY)
- session_template_id (INTEGER FOREIGN KEY)
- exercise_id (INTEGER FOREIGN KEY)
- exercise_order (INTEGER NOT NULL)
- sets (INTEGER NOT NULL)
- reps (INTEGER NOT NULL)
- is_warmup (BOOLEAN DEFAULT 0)
```

**workout_sessions_completed**

```sql
- id (INTEGER PRIMARY KEY)
- workout_plan_id (INTEGER FOREIGN KEY)
- session_template_id (INTEGER FOREIGN KEY)
- started_at (DATETIME NOT NULL)
- completed_at (DATETIME)
- notes (TEXT)
```

**exercise_sets_completed**

```sql
- id (INTEGER PRIMARY KEY)
- completed_session_id (INTEGER FOREIGN KEY)
- exercise_id (INTEGER FOREIGN KEY)
- set_number (INTEGER NOT NULL)
- weight (REAL) -- lbs or kg
- reps (INTEGER NOT NULL)
- is_warmup (BOOLEAN DEFAULT 0)
- completed_at (DATETIME NOT NULL)
```

**preferences** (AsyncStorage)

```
- onboarding_completed (boolean)
- unit_preference (string: 'lbs' | 'kg')
```

## User Stories (Implementation Order)

### Phase 1: Foundation (P0 - Must Complete First)

#### Story 1: Database Infrastructure Setup

**Value**: Enables all subsequent features

**Tasks**:

- Create `lib/storage/database.ts` with expo-sqlite initialization
- Create `lib/storage/types.ts` with TypeScript interfaces for all tables
- Create `lib/storage/db-utils.ts` with query helpers
- Implement schema creation with proper indexes
- Add error handling and logging

**Acceptance Criteria**:

- ✅ All tables created on first app launch
- ✅ Foreign key constraints enforced
- ✅ Can insert/query/update/delete records
- ✅ Database can be reset for development

**Test Verification**:

```typescript
// __tests__/lib/storage/database.test.ts
- Can create database
- All tables exist
- Foreign keys work
- Type-safe queries return correct data
```

---

#### Story 2: Exercise Library Seeding

**Value**: Required for workout generation

**Tasks**:

- Create `lib/storage/seed-data.ts` with 40-50 exercises
- Cover all muscle groups: Chest, Back, Legs, Shoulders, Arms, Core
- Include mix of compound (Squats, Deadlifts, Bench Press) and isolation exercises
- Categorize by equipment (Barbell, Dumbbell, Bodyweight, Cables, Machines)
- Add seed function that runs on first launch

**Acceptance Criteria**:

- ✅ Minimum 5 exercises per major muscle group
- ✅ At least 15 compound exercises
- ✅ Equipment properly categorized
- ✅ Exercises based on mockup examples

**Test Verification**:

```typescript
// __tests__/lib/storage/seed-data.test.ts
- Query by muscle group returns 5+ exercises
- Compound exercises properly flagged
- Equipment filters work
```

---

#### Story 3: Preferences Storage

**Value**: Enables user settings persistence

**Tasks**:

- Create `lib/storage/preferences.ts` with AsyncStorage wrapper
- Add type-safe getters/setters
- Support onboarding_completed flag
- Support unit_preference (lbs/kg)
- Provide default values

**Acceptance Criteria**:

- ✅ Can save/retrieve preferences
- ✅ Default values when not set
- ✅ Type-safe interfaces

**Test Verification**:

```typescript
// __tests__/lib/storage/preferences.test.ts
- Save and retrieve boolean preferences
- Save and retrieve string preferences
- Defaults returned correctly
```

---

### Phase 2: Core Value (P1 - MVP Functionality)

#### Story 4: Workout Wizard - Frequency Selection (Step 1)

**Value**: User can begin creating workout plan

**Tasks**:

- Create `app/wizard/frequency.tsx` matching mockup
- Create `lib/wizard-context.tsx` for wizard state management
- Create `components/ui/SelectionCard.tsx` reusable component
- Implement navigation to equipment selection
- Add step indicator (Step 1 of 4)

**Acceptance Criteria**:

- ✅ UI matches frequency selection mockup
- ✅ Options: 2, 3, 4, 5 days/week with descriptions
- ✅ Only one selectable at a time
- ✅ Continue button navigates forward
- ✅ State persists through wizard

**Test Verification**:

```typescript
// __tests__/app/wizard/frequency.test.tsx
- All options render
- Selection toggles work
- Continue disabled when nothing selected
- State persists on navigation
```

**Files to Create**:

- `app/wizard/frequency.tsx`
- `app/wizard/_layout.tsx` (wizard stack navigation)
- `lib/wizard-context.tsx`
- `components/ui/SelectionCard.tsx`

---

#### Story 5: Workout Wizard - Equipment Selection (Step 2)

**Value**: User can specify available equipment

**Tasks**:

- Create `app/wizard/equipment.tsx` matching mockup
- Extend SelectionCard for multi-select
- Update wizard context for equipment array
- Add step indicator (Step 2 of 4)
- Navigate to focus selection

**Acceptance Criteria**:

- ✅ UI matches equipment mockup
- ✅ Multi-select for Barbell, Dumbbell, Bodyweight, Bands, etc.
- ✅ At least one must be selected
- ✅ Continue navigates forward
- ✅ Progress bar shows 50%

**Test Verification**:

```typescript
// __tests__/app/wizard/equipment.test.tsx
- Multiple selections work
- Validation prevents empty selection
- Progress indicator correct
```

**Files to Create**:

- `app/wizard/equipment.tsx`

---

#### Story 6: Workout Wizard - Focus Selection (Step 3/4)

**Value**: User can specify training goals

**Tasks**:

- Create `app/wizard/focus.tsx` matching mockup
- Add focus type selection (Hypertrophy, Strength, Endurance)
- Add duration selection (4, 6, 8, 12 weeks)
- Wire up "Generate Plan" button
- Add loading state during generation

**Acceptance Criteria**:

- ✅ UI matches focus mockup
- ✅ Radio buttons for focus type
- ✅ Duration selector
- ✅ Generate button triggers algorithm
- ✅ Loading state displays

**Test Verification**:

```typescript
// __tests__/app/wizard/focus.test.tsx
- Focus type selectable
- Duration selectable
- Generate button calls generation function
```

**Files to Create**:

- `app/wizard/focus.tsx`

---

#### Story 7: Rule-Based Workout Generation Engine

**Value**: System creates valid workout plans

**Tasks**:

- Create `lib/workout-generator/engine.ts` with generation algorithm
- Create `lib/workout-generator/muscle-groups.ts` with muscle group distribution logic
- Create `lib/workout-generator/exercise-selector.ts` for exercise selection
- Implement core algorithm:
  1. Calculate weekly volume targets per muscle (9-20 sets/week)
  2. Distribute muscle groups across sessions (e.g., Upper/Lower split for 4 days)
  3. Select exercises matching equipment and muscle groups
  4. Order exercises (compound first, isolation after)
  5. Assign sets/reps based on focus (Hypertrophy: 3x8-12, Strength: 5x3-5, Endurance: 3x15-20)
  6. Validate constraints (max 5 exercises/session, 48h muscle recovery)

**Acceptance Criteria**:

- ✅ Generates plan with correct session count
- ✅ Each muscle group gets 9-20 sets/week
- ✅ Compound exercises appear first
- ✅ No session exceeds 5 exercises
- ✅ Same muscles not trained consecutively
- ✅ Sets/reps match focus type

**Test Verification**:

```typescript
// __tests__/lib/workout-generator/engine.test.ts
- 2-day frequency creates 2 sessions
- 4-day frequency creates 4 sessions
- Muscle volume within 9-20 sets
- Compound exercises first in each session
- Recovery rules respected
- Hypertrophy plan has 3x8-12 rep scheme
- Strength plan has 5x3-5 rep scheme
```

**Files to Create**:

- `lib/workout-generator/engine.ts`
- `lib/workout-generator/muscle-groups.ts`
- `lib/workout-generator/exercise-selector.ts`
- `lib/workout-generator/types.ts`

---

#### Story 8: Generated Plan Review Screen

**Value**: User can review and save generated plan

**Tasks**:

- Create `app/plan/[id].tsx` matching mockup
- Create `components/WorkoutPlanCard.tsx`
- Create `components/SessionCard.tsx`
- Create `components/ExerciseListItem.tsx`
- Implement expandable session details
- Save plan to database on "Save Plan"
- Navigate to tracking on "Start Session"

**Acceptance Criteria**:

- ✅ UI matches plan mockup
- ✅ Shows plan overview (name, duration, frequency)
- ✅ Sequence overview with session carousel
- ✅ Expandable session details
- ✅ Save creates database records
- ✅ Start Session navigates to tracking

**Test Verification**:

```typescript
// __tests__/app/plan/[id].test.tsx
- Plan details display correctly
- Sessions expandable/collapsible
- Save button creates DB records
- Navigation to session works
```

**Files to Create**:

- `app/plan/[id].tsx`
- `components/WorkoutPlanCard.tsx`
- `components/SessionCard.tsx`
- `components/ExerciseListItem.tsx`

---

#### Story 9: Active Workout Tracking Screen

**Value**: User can track live workout with set/rep/weight logging

**Tasks**:

- Create `app/session/[id].tsx` matching mockup
- Create `components/SetTracker.tsx` for set input table
- Implement exercise navigation (previous/next)
- Query last performance data for placeholders
- Save sets to exercise_sets_completed on completion
- Create session record on start
- Handle "Finish" to complete session

**Acceptance Criteria**:

- ✅ UI matches session mockup
- ✅ Exercise navigation works
- ✅ Previous performance shows as placeholder
- ✅ Weight/reps input fields
- ✅ Checkboxes mark sets complete
- ✅ "Add Set" adds new row
- ✅ "Finish" saves all data
- ✅ Partial progress saved on exit

**Test Verification**:

```typescript
// __tests__/app/session/[id].test.tsx
- Exercise navigation works
- Previous data populates inputs
- Set completion toggles
- Add set creates new row
- Finish saves to database
```

**Files to Create**:

- `app/session/[id].tsx`
- `components/SetTracker.tsx`

---

#### Story 10: Dashboard Home Screen (Active Plan)

**Value**: User sees current plan and can start sessions

**Tasks**:

- Update `app/(tabs)/index.tsx` matching dashboard mockup
- Query active plan from workout_plans
- Show next scheduled session prominently
- Display "Generate Your First Plan" empty state
- Add "Start Session" button to begin tracking
- Show upcoming sessions in sequence

**Acceptance Criteria**:

- ✅ Empty state when no plan
- ✅ Active plan displays when exists
- ✅ Next session highlighted
- ✅ Start button navigates to tracking
- ✅ Completed sessions marked

**Test Verification**:

```typescript
// __tests__/app/(tabs)/index.test.tsx
- Empty state renders correctly
- Active plan shows when exists
- Next session identified correctly
- Navigation to wizard works
- Navigation to session works
```

**Files to Modify**:

- `app/(tabs)/index.tsx`
- `app/(tabs)/_layout.tsx` (update tab icons/labels)

---

### Phase 3: History & Progress (P2 - Enhancements)

#### Story 11: History Calendar View

**Value**: User can review past workout history

**Tasks**:

- Update `app/(tabs)/history.tsx` matching mockup
- Create `components/Calendar.tsx` component
- Query workout_sessions_completed grouped by date
- Implement month/year toggle
- Add month navigation
- Show session summary on day tap

**Acceptance Criteria**:

- ✅ UI matches calendar mockup
- ✅ Calendar shows current month
- ✅ Workout days highlighted
- ✅ Month navigation works
- ✅ Day tap shows session details

**Test Verification**:

```typescript
// __tests__/app/(tabs)/history.test.tsx
- Calendar renders current month
- Workout days highlighted
- Navigation updates display
- Toggle changes view
```

**Files to Create**:

- `components/Calendar.tsx`

**Files to Modify**:

- `app/(tabs)/history.tsx`

---

#### Story 12: Exercise History & Progress Chart

**Value**: User can see strength progression over time

**Tasks**:

- Create `app/exercise/[id]/history.tsx`
- Query exercise_sets_completed for specific exercise
- Display historical sets with date/weight/reps
- Create `components/ProgressChart.tsx` with SVG line chart
- Show max weight per session over time
- X-axis: dates, Y-axis: weight

**Acceptance Criteria**:

- ✅ Exercise name and total sessions shown
- ✅ Historical data listed
- ✅ Line chart renders correctly
- ✅ Chart shows weight progression
- ✅ Data points chronological

**Test Verification**:

```typescript
// __tests__/app/exercise/[id]/history.test.tsx
- Historical data displays
- Chart renders with data
- Axes labeled correctly
```

**Files to Create**:

- `app/exercise/[id]/history.tsx`
- `components/ProgressChart.tsx`

---

## Story Dependencies

```text
Foundation (P0):
  Story 1 (Database) → Story 2 (Exercises), Story 3 (Preferences)

Core Value (P1):
  Story 3 → Story 4 (Frequency) → Story 5 (Equipment) → Story 6 (Focus)
  Story 2 + Story 6 → Story 7 (Generation)
  Story 7 → Story 8 (Plan Review)
  Story 8 → Story 9 (Tracking)
  Story 8 + Story 9 → Story 10 (Dashboard)

Enhancements (P2):
  Story 9 → Story 11 (Calendar) → Story 12 (Progress Chart)
```

## Critical Files

**Database Layer**:

- `lib/storage/database.ts` - Database initialization and schema
- `lib/storage/types.ts` - TypeScript interfaces for tables
- `lib/storage/db-utils.ts` - Query helper functions
- `lib/storage/seed-data.ts` - Exercise library seeding
- `lib/storage/preferences.ts` - AsyncStorage wrapper

**Workout Generation**:

- `lib/workout-generator/engine.ts` - Main generation algorithm
- `lib/workout-generator/muscle-groups.ts` - Muscle group distribution
- `lib/workout-generator/exercise-selector.ts` - Exercise selection logic

**UI Components** (follow Button.tsx pattern):

- `components/ui/SelectionCard.tsx` - Wizard option cards
- `components/WorkoutPlanCard.tsx` - Plan overview
- `components/SessionCard.tsx` - Session details
- `components/ExerciseListItem.tsx` - Exercise display
- `components/SetTracker.tsx` - Set input table
- `components/Calendar.tsx` - Calendar grid
- `components/ProgressChart.tsx` - SVG line chart

**Routes**:

- `app/wizard/frequency.tsx` - Step 1 of wizard
- `app/wizard/equipment.tsx` - Step 2 of wizard
- `app/wizard/focus.tsx` - Step 3/4 of wizard
- `app/plan/[id].tsx` - Plan review screen
- `app/session/[id].tsx` - Active workout tracking
- `app/(tabs)/index.tsx` - Dashboard home
- `app/(tabs)/history.tsx` - History calendar
- `app/exercise/[id]/history.tsx` - Exercise progress

## Verification Approach

### Story-Level Testing

Each story includes unit tests in `__tests__/` matching the file structure:

- Database operations test data persistence
- Generation algorithm tests validate workout rules
- Component tests verify UI behavior and state management
- Integration tests ensure navigation flows work

### End-to-End Manual Testing

After completing each phase:

**Phase 1 (Foundation)**:

1. Open app, verify database created
2. Query exercises table, verify 40+ exercises exist
3. Set preferences, verify persistence across app restarts

**Phase 2 (Core Value - MVP Complete)**:

1. Open app, see empty state with "Generate First Plan"
2. Tap button, enter wizard (Step 1 of 4)
3. Select 4 days/week, tap Continue (Step 2 of 4)
4. Select Barbell + Dumbbell, tap Continue (Step 3 of 4)
5. Select Hypertrophy + 8 weeks, tap Generate Plan
6. Review generated plan, verify 4 sessions shown
7. Expand session 1, verify 3-5 exercises with 3x8-12 rep scheme
8. Tap Save, verify plan persists
9. Tap Start Session 1, enter tracking screen
10. Input weight/reps for each set, mark complete
11. Tap Finish, return to dashboard
12. Verify dashboard shows active plan with next session

**Phase 3 (Enhancements - Full MVP)**:

1. Navigate to History tab
2. Verify calendar shows completed workout on today's date
3. Tap date, see session summary
4. Toggle to year view, verify display updates
5. Navigate to exercise history from session
6. Verify line chart shows weight progression
7. Verify historical sets listed with dates

### Test Commands

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for TDD
npm run test:coverage   # Coverage report
npm run typecheck       # TypeScript validation
```

## Implementation Notes

### Component Patterns (Follow Button.tsx)

- TypeScript interfaces for props
- Variant and size props
- Use `cn()` utility from `lib/utils/cn.ts`
- NativeWind classes for styling
- Accessibility props (accessibilityRole, accessibilityLabel)

### Navigation (Expo Router)

- File-based routing in `app/` directory
- Use `Link` component or `router.push()` for navigation
- Dynamic routes with `[id]` syntax
- Tab navigation in `app/(tabs)/`
- Stack navigation for wizards

### State Management

- React Context for wizard state
- Local state with useState for UI interactions
- Database queries for data persistence
- AsyncStorage for preferences

### Testing Approach

- Follow TDD: Write tests first, implement to pass
- Use React Native Testing Library
- Test user interactions with fireEvent
- Mock database queries in tests
- Test error states and loading states

### Design System

Colors already configured in `tailwind.config.js`:

- `bg-primary` (#13ec6d - bright green)
- `bg-background-dark` (#102218)
- `bg-surface-dark` (#1c2e24)
- `text-muted` (#9db9a8)

Fonts loaded in `app/_layout.tsx`:

- Lexend (display)
- Noto Sans (body)

## Success Criteria

**MVP Complete** after Story 10:

- User can create workout plan via wizard
- User can track active workout sessions
- User can view active plan on dashboard
- Data persists across app restarts
- All tests passing

**Full Feature Set** after Story 12:

- User can review workout history
- User can see progress charts
- Complete fitness tracking experience
