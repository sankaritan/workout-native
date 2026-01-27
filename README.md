# Workout App

A fitness/workout planning and tracking application built with Expo (React Native) for web and iOS platforms.

## Features

Workout App helps you design, track, and analyze your fitness journey with three core capabilities. Create personalized workout plans through an intuitive wizard that generates scientifically-backed programs based on your weekly frequency, available equipment, and training focus. Choose between hypertrophy, strength, or endurance goals, and select program durations from 4 to 12 weeks. Track your workouts in real-time with an easy-to-use interface that logs sets, reps, and weights while showing your previous performance data to help you progressively overload.

Review your fitness progress with a comprehensive history calendar that visualizes completed workouts. View detailed exercise-specific charts that track your strength gains over time. The app uses rule-based algorithms to distribute muscle groups across sessions and ensures proper recovery time between training the same muscles. All your data is persisted locally for seamless cross-platform use on web and iOS.

### Main Features

- **Personalized Workout Plans** - Generate custom programs via wizard based on frequency, equipment, and goals
- **Real-Time Workout Tracking** - Log sets, reps, and weights with progressive overload support
- **Progress Analytics** - View history calendar and exercise-specific strength progression charts
- **Rule-Based Programming** - Smart muscle group distribution and recovery time management
- **Cross-Platform** - Works seamlessly on web and iOS with local data persistence

## Tech Stack

- **Framework**: Expo SDK 54 with React Native
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Storage**: AsyncStorage (cross-platform data persistence)
- **Testing**: Jest + React Native Testing Library
- **Icons**: MaterialIcons from @expo/vector-icons
- **Fonts**: Lexend (display), Noto Sans (body)

## Prerequisites

- **Node.js**: >= 20.0.0 (required for Metro bundler compatibility)
- **npm**: Comes with Node.js
- **nvm** (optional but recommended): For managing Node versions

## Getting Started

### 1. Install Node.js 20+

If you're using nvm:

```bash
nvm install 20
nvm use 20
```

Otherwise, download and install Node.js 20+ from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `w` to open in web browser
- Press `i` to open in iOS simulator (macOS only)
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go app on your phone

## Available Commands

```bash
npm start              # Start Expo dev server (interactive)
npm run web            # Start for web directly
npm run ios            # Start for iOS simulator
npm run android        # Start for Android emulator

npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report

npm run typecheck      # Run TypeScript type checking
```

## Project Structure

```
workout-app/
├── app/                    # Expo Router routes (file-based routing)
│   ├── (tabs)/            # Route groups (parentheses don't affect URL)
│   ├── +html.tsx          # Special routes (HTML customization for web)
│   ├── +not-found.tsx     # 404 page handler
│   └── _layout.tsx        # Root layout with fonts
├── components/
│   ├── ui/                # Reusable UI components (Button, etc.)
│   └── __tests__/         # Component tests
├── lib/
│   ├── utils/             # Utility functions (cn.ts for classnames)
│   └── storage/           # Database and preferences logic
├── constants/
│   └── theme.ts           # Design tokens and theme configuration
├── __tests__/             # Integration/route tests
├── design-assets/         # Original design mockups for reference
└── global.css             # Global styles for NativeWind
```

### Key Concepts

#### Expo Router File Naming Conventions

- **`(folderName)/`** - Route groups: Parentheses create logical groups without affecting the URL structure
  - Example: `app/(tabs)/index.tsx` → URL: `/`
- **`+filename.tsx`** - Special routes: Plus sign indicates special functionality
  - `+html.tsx` - Custom HTML template for web
  - `+not-found.tsx` - 404 error page
- **`_layout.tsx`** - Layout files: Underscore indicates layout components

#### Path Aliases

Use `@/` for absolute imports:
```typescript
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
```

## Testing

### Running Tests

```bash
npm test               # Run all tests
npm run test:watch     # Watch mode for TDD
npm run test:coverage  # Generate coverage report
```

### Testing Conventions

- **NEVER** place test files in `app/` directory - files there become routes
- For components and libraries: place tests next to code
  - Same directory: `Button.tsx` + `Button.test.tsx`
  - Or subdirectory: `Button.tsx` + `__tests__/Button.test.tsx`
- All test files must use TypeScript (`.test.tsx` or `.test.ts`)
- Follow TDD approach: write tests first, then implement features

### Example Test

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

## Design System

### Colors

Configured in `tailwind.config.js`:

```
primary:          #13ec6d (bright green)
background-dark:  #102218
surface-dark:     #1c2e24
text-muted:       #9db9a8
```

### Using Styles

NativeWind allows you to use Tailwind classes directly:

```tsx
import { View, Text } from 'react-native';

export function Card() {
  return (
    <View className="bg-surface-dark p-4 rounded-lg">
      <Text className="text-white font-bold">Hello World</Text>
    </View>
  );
}
```

Use the `cn()` utility to merge classes conditionally:

```tsx
import { cn } from '@/lib/utils/cn';

<Button className={cn('bg-primary', isDisabled && 'opacity-50')} />
```

## Development Workflow

1. **Start dev server**: `npm start` or `npm run web`
2. **Write tests first** (TDD approach): Create test files before implementation
3. **Implement features**: Build components and logic to pass tests
4. **Run tests**: `npm test` to ensure everything works
5. **Type check**: `npm run typecheck` to catch TypeScript errors
6. **Iterate**: Make changes and test immediately with hot reload

## Troubleshooting

### "configs.toReversed is not a function" Error

This means you're using Node.js < 20. Upgrade to Node.js 20+:
```bash
nvm install 20
nvm use 20
```

### "TypeError: fetch failed" on Startup

Use offline mode to bypass network checks:
```bash
npx expo start --web --offline
```

### Tests Not Running

- Ensure test files use `.test.ts` or `.test.tsx` extension
- Check that tests are in `__tests__/` directories or next to code
- Verify tests are NOT in `app/` directory (those become routes)

### Metro Bundler Issues

Clear cache and restart:
```bash
npx expo start -c
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native Documentation](https://reactnative.dev/)

## Contributing

1. Follow the TDD approach
2. Write TypeScript for all code
3. Use the design system colors and components
4. Run tests and type checking before committing
5. Keep components focused and reusable

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
