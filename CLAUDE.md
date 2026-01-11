# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Whenever you make an update to the codebase, check whether CLAUDE.md should not be updated (such as describing project overview and current state) and if so, make updates there too.

## Project Overview

Workout App - A fitness/workout planning and tracking application. Currently in **design phase** with high-fidelity HTML prototypes.

## Coding and Engineering principles

- Build for extensibility by default if possible. If there is part of app that use very similar building block twice, consider generalizing it and reusing it in those places.
- Use TDD approach when building new features. Create new tests first, then build logic to make them pass. Always run all tests at the end of building a feature to ensure nothing got broken and there are no regressions.

## Current State

This repository contains design mockups only - no build system or application framework is configured yet. The designs serve as the reference for future implementation.

## Design System

The mockups use:

- **Tailwind CSS** (via CDN with forms and container-queries plugins)
- **Google Material Symbols Outlined** for icons
- **Fonts**: Lexend (display), Noto Sans (body)
- **Dark mode** enabled by default (`class="dark"` on html element)

### Color Palette

```text
primary: #13ec6d (bright green)
background-light: #f6f8f7
background-dark: #102218
surface-dark: #1c2e24
surface-active: #263c30
text-muted: #9db9a8
border: #28392f, #3b5445
```

## Design Assets Structure

All mockups are in `design-assets/stitch_workout_frequency_selection/`:

- `workout_frequency_selection_*` - Onboarding flow screens
- `equipment_selection` - Equipment picker with checkboxes
- `primary_focus_selection` - Goal selection
- `generated_workout_plan` - AI-generated 4-week plan display
- `current_workout_session` - Active workout tracking with set/rep inputs
- `workout_history_calendar` - Historical workout view

Each screen has `code.html` (source) and `screen.png` (preview).

## Key UI Patterns

- Bottom navigation: Design, Track, History, Profile
- Step indicators for multi-step flows
- Expandable details sections using `<details>` elements
- Custom checkbox styling with external image for checked state
- Number inputs with hidden spin buttons
