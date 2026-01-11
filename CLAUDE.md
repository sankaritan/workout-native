# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout App - A fitness/workout planning and tracking application. Currently in **design phase** with high-fidelity HTML prototypes.

## Current State

This repository contains design mockups only - no build system or application framework is configured yet. The designs serve as the reference for future implementation.

## Design System

The mockups use:
- **Tailwind CSS** (via CDN with forms and container-queries plugins)
- **Google Material Symbols Outlined** for icons
- **Fonts**: Lexend (display), Noto Sans (body)
- **Dark mode** enabled by default (`class="dark"` on html element)

### Color Palette
```
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
