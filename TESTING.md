# Testing Strategy

This document describes the testing approach for the Workout Native app.

## Test Philosophy

We follow a balanced testing approach:

1. **Fast Execution**: All tests use virtual DOM (React Native Testing Library) instead of full browser e2e
2. **Comprehensive Coverage**: Tests range from isolated unit tests to end-to-end acceptance tests
3. **Focused Tests**: Each test validates a specific behavior or workflow
4. **Maintainable**: Tests are written in TypeScript with clear descriptions and patterns

## Test Organization

```
__tests__/
  acceptance/          # End-to-end user workflow tests
  app/                 # Route/screen tests
    (tabs)/            # Tab screens
    wizard/            # Wizard flow screens
    session/           # Workout session screens
    exercise/          # Exercise screens
  components/          # Component tests (also in components/__tests__)
  lib/                 # Library/utility tests
    storage/           # Storage layer tests
    workout-generator/ # Workout generation algorithm tests

components/
  __tests__/           # Component unit tests
```

## Test Types

### 1. Acceptance Tests (`__tests__/acceptance/`)

**Purpose**: Validate complete user workflows end-to-end

**Examples**:
- Creating a workout plan from scratch
- Logging exercises during a workout session
- Progressive overload tracking

**Key Characteristics**:
- Test actual user journeys
- Use real storage layer (in-memory)
- No UI rendering (storage/logic only)
- Fast execution (~1-2s for suite)

**When to Add**: When implementing new major user workflows

### 2. Route/Screen Tests (`__tests__/app/`)

**Purpose**: Validate individual screens render correctly and handle user interactions

**Examples**:
- Home screen shows active workout plan
- Session screen displays exercises
- Wizard screens handle navigation

**Key Characteristics**:
- Test React component rendering
- Mock storage and navigation
- Use React Native Testing Library
- Verify UI elements and interactions

**When to Add**: For each new screen/route

### 3. Component Tests (`components/__tests__/`, `__tests__/components/`)

**Purpose**: Validate reusable UI components in isolation

**Examples**:
- Button renders with correct styles
- SetTracker handles set input
- Calendar displays dates correctly

**Key Characteristics**:
- Isolated component testing
- Props-based testing
- Mock external dependencies
- Fast unit tests

**When to Add**: For each reusable component

### 4. Library/Logic Tests (`__tests__/lib/`)

**Purpose**: Validate business logic and utilities

**Examples**:
- Workout generation algorithm
- Exercise selection logic
- Date utilities
- Storage operations

**Key Characteristics**:
- Pure function testing
- Algorithm validation
- No UI dependencies
- Very fast execution

**When to Add**: For any business logic or utility function

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- __tests__/acceptance/workout-plan-creation.test.ts

# Run tests matching pattern
npm test -- wizard
```

## Test Performance

Current metrics (as of implementation):
- **Total Tests**: 345 tests in 32 suites
- **Execution Time**: ~7-8 seconds
- **Pass Rate**: 100%

**Performance Goals**:
- Keep total execution time under 15 seconds
- Individual test suites should complete in < 2 seconds
- No single test should take > 1 second

## Testing Best Practices

### 1. Use Descriptive Test Names

```typescript
// ✅ Good
it("should create workout plan with correct frequency and sessions", () => {})

// ❌ Bad
it("creates plan", () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it("should calculate progress correctly", () => {
  // Arrange
  const plan = createTestPlan();
  const sessions = [/* ... */];
  
  // Act
  const progress = calculateProgress(plan, sessions);
  
  // Assert
  expect(progress).toBe(50);
});
```

### 3. Test User Workflows, Not Implementation

```typescript
// ✅ Good - tests user behavior
it("should save workout when user completes session", () => {
  startSession();
  logSets();
  finishSession();
  expect(getCompletedSessions()).toHaveLength(1);
});

// ❌ Bad - tests internal implementation
it("should call insertCompletedSession with correct params", () => {
  expect(mockInsert).toHaveBeenCalledWith({ ... });
});
```

### 4. Keep Tests Independent

```typescript
// Each test should set up its own data
beforeEach(async () => {
  await initStorage();
  await resetStorage();
  await seedExercises();
});
```

### 5. Mock External Dependencies

```typescript
// Mock expo-router for navigation
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock AsyncStorage for storage
jest.mock("@react-native-async-storage/async-storage");
```

## Coverage Goals

- **Overall**: > 60% statement coverage
- **Critical Paths**: > 80% coverage for:
  - Workout generation
  - Exercise logging
  - Progress tracking
- **Components**: > 90% coverage for UI components

Current coverage:
- Components: 98.54%
- Workout Generator: 76.43%
- Storage: 24.57% (low is acceptable - mostly CRUD operations tested via acceptance tests)

## Adding New Tests

When adding new features, follow this checklist:

1. **[ ] Write acceptance test first** (TDD approach)
   - Define the user workflow
   - Write test that validates end-to-end flow
   
2. **[ ] Add route/screen tests**
   - Test component renders
   - Test user interactions
   - Test error states

3. **[ ] Add component tests** (if creating reusable components)
   - Test with different props
   - Test edge cases

4. **[ ] Add logic tests** (if adding business logic)
   - Test algorithms
   - Test utilities
   - Test data transformations

5. **[ ] Verify all tests pass**
   ```bash
   npm test
   ```

6. **[ ] Check test performance**
   - Ensure tests complete quickly
   - No timeouts or hanging tests

## Common Testing Patterns

### Testing Storage Operations

```typescript
beforeEach(async () => {
  await initStorage();
  await resetStorage();
  await seedExercises();
});

it("should save and retrieve workout plan", () => {
  const plan = { /* ... */ };
  const id = insertWorkoutPlan(plan);
  const retrieved = getWorkoutPlanById(id);
  expect(retrieved).toEqual(expect.objectContaining(plan));
});
```

### Testing React Components

```typescript
it("should render with correct props", () => {
  render(<Button label="Click Me" onPress={mockFn} />);
  expect(screen.getByText("Click Me")).toBeTruthy();
});

it("should call handler on press", () => {
  const onPress = jest.fn();
  render(<Button label="Click" onPress={onPress} />);
  fireEvent.press(screen.getByText("Click"));
  expect(onPress).toHaveBeenCalled();
});
```

### Testing Async Operations

```typescript
it("should load data on mount", async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeTruthy();
  });
});
```

## Troubleshooting

### Tests Running Slowly

1. Check for missing mocks (real API calls)
2. Look for unnecessary `await` calls
3. Use `jest.mock()` for heavy dependencies

### Flaky Tests

1. Avoid timing dependencies
2. Properly clean up after tests
3. Use `waitFor()` for async assertions

### Mock Issues

1. Ensure mocks are set up before imports
2. Clear mocks in `beforeEach()`
3. Use `jest.clearAllMocks()` or `jest.resetAllMocks()`

## Continuous Improvement

We continuously improve our testing:

1. **Monitor test execution time** - Keep it under 15s
2. **Review failing tests** - Fix or update as needed
3. **Add tests for bugs** - Regression prevention
4. **Refactor test code** - Keep tests maintainable
5. **Update documentation** - Keep this file current

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
