# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Note**: README.md is for developers getting started with the project. When making significant changes, consider whether README.md needs updating too (setup instructions, commands, etc.). This file (CLAUDE.md) is for AI development context and coding patterns.

## Project Overview

Workout App - A fitness/workout planning and tracking application built with Expo (React Native) for web and iOS platforms.

## Coding and Engineering principles

- Build for extensibility by default if possible. If there is part of app that use very similar building block twice, consider generalizing it and reusing it in those places.
- Use TDD approach when building new features. Create new tests first, then build logic to make them pass. Always run all tests at the end of building a feature to ensure nothing got broken and there are no regressions.
- **All features must work on both web and iOS.** Even if iOS is the primary end-user platform, developers test features on web during development. If a feature doesn't work on web, it's useless for development workflow. Never make features "mobile-only".

## Tech Stack

- **Framework**: Expo SDK 54 with React Native
- **Language**: TypeScript (strict mode). Never use Javascript.
- **Routing**: Expo Router (file-based routing in `app/` directory)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Storage**: AsyncStorage (all data - works cross-platform on web and mobile)
- **Testing**: Jest + React Native Testing Library
- **Icons**: MaterialIcons from @expo/vector-icons

## Development Commands

```bash
npm start              # Start Expo dev server
npm run web            # Start for web
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run typecheck      # TypeScript type check
```

**Note**: Project requires Node.js >= 20 (current v18 works but may have issues).

## Project Structure

```
app/                    # Expo Router routes (file-based)
  (tabs)/               # Route groups (parentheses don't affect URL)
  +html.tsx             # Special routes (plus sign = HTML customization)
  _layout.tsx           # Root layout with fonts
components/
  ui/                   # Reusable UI primitives (Button, etc.)
  __tests__/            # Component tests
lib/
  utils/                # Utilities (cn.ts for classnames)
  storage/              # Database and preferences
constants/
  theme.ts              # Design tokens
__tests__/              # Route/integration tests (NOT in app/ - files there become routes)
design-assets/          # Original HTML mockups for reference
```

## Design System

Configured in `tailwind.config.js` with colors from mockups:

```
primary: #13ec6d (bright green)
background-dark: #102218
surface-dark: #1c2e24
text-muted: #9db9a8
```

**Fonts**: Lexend (display), Noto Sans (body) - loaded via @expo-google-fonts

## Key Patterns

- Use `cn()` from `@/lib/utils/cn` to merge Tailwind classes
- Import global.css in root layout for NativeWind
- Use `@/` path alias for imports

## Testing Patterns

- **NEVER** place test files in the `app/` directory - files there become routes in Expo Router
- For code in `components/` and `lib/`: tests should live next to the code they test
  - Either: `Button.tsx` + `Button.test.tsx` (same directory)
  - Or: `Button.tsx` + `__tests__/Button.test.tsx` (subdirectory)
- For route-related tests: use `__tests__/` directory in project root
- All test files must use TypeScript (`.test.tsx` or `.test.ts`)

## Design Assets

Original mockups in `design-assets/stitch_workout_frequency_selection/` serve as reference for implementing screens. Each has `code.html` and `screen.png`.
