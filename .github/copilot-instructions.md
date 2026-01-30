# Copilot Instructions for Workout App

## Project Overview

Workout App is a fitness/workout planning and tracking application built with Expo (React Native) for web and iOS platforms. It helps users design personalized workout plans, track workouts in real-time, and analyze progress through comprehensive history and charts.

### Tech Stack

- **Framework**: Expo SDK 54 with React Native
- **Language**: TypeScript (strict mode only - no JavaScript)
- **Routing**: Expo Router (file-based routing in `app/` directory)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Storage**: AsyncStorage (cross-platform - works on web and mobile)
- **Testing**: Jest + React Native Testing Library
- **Icons**: MaterialIcons from @expo/vector-icons
- **Fonts**: Lexend (display), Noto Sans (body) - loaded via @expo-google-fonts

### Runtime Requirements

- **Node.js**: >= 20.0.0 (REQUIRED - older versions will fail with "configs.toReversed is not a function")
- **npm**: Comes with Node.js

## Development Commands

Always run commands in this exact order to avoid issues:

### Initial Setup

```bash
npm install  # Install dependencies - ALWAYS run first after cloning
```

### Development Server

```bash
npm start              # Start Expo dev server (interactive - recommended)
npm run web            # Start for web directly
npm run ios            # Start for iOS simulator (macOS only)
npm run android        # Start for Android emulator
```

**Note**: If you encounter "TypeError: fetch failed" on startup, use offline mode:
```bash
npx expo start --web --offline
```

### Testing

```bash
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode (recommended for TDD)
npm run test:coverage  # Run tests with coverage report
```

**ALWAYS run tests after making code changes** to ensure no regressions.

### Type Checking

```bash
npm run typecheck      # Run TypeScript type checking (no emit)
```

### Building

```bash
npm run build:web      # Export web build to web-build/ directory
```

### Clearing Cache

If you encounter Metro bundler issues or stale data:

```bash
npx expo start -c      # Clear cache and restart
```

## Project Structure and Architecture

```
workout-native/
├── app/                    # Expo Router routes (file-based routing)
│   ├── (tabs)/            # Route groups (parentheses don't affect URL structure)
│   │   ├── index.tsx      # Home tab route (URL: /)
│   │   ├── plans.tsx      # Plans tab route (URL: /plans)
│   │   ├── history.tsx    # History tab route (URL: /history)
│   │   └── _layout.tsx    # Tabs layout with navigation
│   ├── +html.tsx          # Special route: Custom HTML template for web
│   ├── +not-found.tsx     # Special route: 404 error page
│   └── _layout.tsx        # Root layout with fonts and global providers
├── components/
│   ├── ui/                # Reusable UI primitives (Button, etc.)
│   └── __tests__/         # Component unit tests
├── lib/
│   ├── utils/             # Utility functions (cn.ts for classnames)
│   └── storage/           # Database and preferences logic (AsyncStorage)
├── constants/
│   └── theme.ts           # Design tokens (colors, spacing, etc.)
├── __tests__/             # Integration/route tests (NOT in app/)
├── design-assets/         # Original HTML mockups for reference
│   └── stitch_workout_frequency_selection/
│       ├── code.html      # HTML mockup code
│       └── screen.png     # Screenshot of mockup
├── global.css             # Global styles for NativeWind
├── tailwind.config.js     # Tailwind configuration with custom colors
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup file
└── tsconfig.json          # TypeScript configuration
```

### Key Architectural Elements

1. **Expo Router File Naming Conventions**:
   - `(folderName)/` - Route groups: Parentheses create logical groups without affecting URL
     - Example: `app/(tabs)/index.tsx` → URL: `/`
   - `+filename.tsx` - Special routes: Plus sign indicates special functionality
     - `+html.tsx` - Custom HTML template for web
     - `+not-found.tsx` - 404 error page
   - `_layout.tsx` - Layout files: Underscore indicates layout components

2. **Path Aliases**:
   - Use `@/` for absolute imports from project root
   - Example: `import { Button } from '@/components/ui/Button';`

3. **Configuration Files**:
   - `tailwind.config.js` - Custom colors and theme configuration
   - `jest.config.js` - Test configuration (preset: jest-expo)
   - `tsconfig.json` - TypeScript strict mode enabled
   - `babel.config.js` - Babel configuration for NativeWind

## Testing Patterns and Requirements

### Critical Testing Rules

1. **NEVER place test files in the `app/` directory** - files there become routes in Expo Router and will cause routing errors
2. **For components and libraries**: place tests next to the code they test
   - Same directory: `Button.tsx` + `Button.test.tsx`
   - Or subdirectory: `Button.tsx` + `__tests__/Button.test.tsx`
3. **For route/integration tests**: use `__tests__/` directory in project root
4. **All test files must use TypeScript** (`.test.tsx` or `.test.ts`)
5. **Follow TDD approach**: Write tests first, then implement features

### Test Example

```typescript
import { render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });
});
```

## Design System and Styling

### Custom Colors (configured in tailwind.config.js)

```javascript
primary:          #13ec6d    // Bright green for primary actions
background-dark:  #102218    // Dark background
surface-dark:     #1c2e24    // Dark surface for cards
text-muted:       #9db9a8    // Muted text color
```

### Styling Patterns

1. **Use NativeWind classes directly**:
```tsx
<View className="bg-surface-dark p-4 rounded-lg">
  <Text className="text-white font-bold">Hello</Text>
</View>
```

2. **Use `cn()` utility for conditional classes**:
```tsx
import { cn } from '@/lib/utils/cn';

<Button className={cn('bg-primary', isDisabled && 'opacity-50')} />
```

3. **Import global.css in root layout** - Already done in `app/_layout.tsx`

## Development Workflow and Best Practices

### General Principles

1. **Cross-Platform Support**: All features MUST work on both web and iOS
   - Even though iOS is the primary end-user platform, developers test on web during development
   - Never make features "mobile-only"

2. **TDD Approach**: 
   - Write tests first
   - Implement features to make tests pass
   - Run all tests to ensure no regressions

3. **Build for Extensibility**:
   - If you use similar building blocks twice, generalize and reuse
   - Create reusable components in `components/ui/`

4. **TypeScript Strict Mode**:
   - Never use JavaScript
   - All files must be `.ts` or `.tsx`
   - Type everything properly

5. **Update Documentation**:
   - Update README.md when setup changes
   - Update IMPLEMENTATION_PLAN.md when requirements change

### Typical Workflow

1. Start dev server: `npm start` or `npm run web`
2. Write tests first (TDD)
3. Implement features to pass tests
4. Run tests: `npm test`
5. Type check: `npm run typecheck`
6. Iterate with hot reload

## Common Pitfalls and Workarounds

### 1. Node.js Version Issues

**Error**: "configs.toReversed is not a function"

**Solution**: Upgrade to Node.js 20+
```bash
nvm install 20
nvm use 20
npm install
```

### 2. Network Issues on Startup

**Error**: "TypeError: fetch failed"

**Solution**: Use offline mode
```bash
npx expo start --web --offline
```

### 3. Test Files Creating Routes

**Error**: Test files showing up as routes in navigation

**Solution**: NEVER place test files in `app/` directory. Use `__tests__/` in project root or next to component files.

### 4. Metro Bundler Cache Issues

**Error**: Stale data, module not found, or other bundler errors

**Solution**: Clear cache and restart
```bash
npx expo start -c
```

### 5. Import Path Issues

**Error**: Module not found with relative imports

**Solution**: Use `@/` path alias instead of relative paths
```typescript
// Bad
import { Button } from '../../../components/ui/Button';

// Good
import { Button } from '@/components/ui/Button';
```

### 6. Styling Not Working

**Error**: Tailwind classes not applying

**Solution**: 
- Ensure `global.css` is imported in root layout
- Check `tailwind.config.js` for custom color names
- Use `cn()` utility to merge classes properly

## Storage and Data Persistence

- All data is stored using AsyncStorage
- Works cross-platform (web and mobile)
- Located in `lib/storage/`
- Data persists locally across sessions

## Additional Notes

1. **Design Assets**: Original mockups in `design-assets/stitch_workout_frequency_selection/` serve as reference for implementing screens. Each has `code.html` and `screen.png`.

2. **No CI/CD Yet**: Currently no GitHub Actions workflows configured. Tests and type checking must be run manually.

3. **Validation Before Commit**: 
   - Always run `npm test` to ensure all tests pass
   - Always run `npm run typecheck` to ensure no TypeScript errors
   - Test on both web and iOS if possible

4. **Agent Instructions**: For more detailed coding patterns, see `AGENTS.md` and `CLAUDE.md` in the repository root.
