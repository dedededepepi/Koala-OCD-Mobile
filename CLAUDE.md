# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native OCD tracking application called "Koala OCD Tracker" that helps users monitor their compulsions and resistance efforts. The app provides coping tools, analytics, achievements, and data persistence through local storage.

## Common Development Commands

Based on the package.json in the `project/` directory:

- **Start development server**: `cd project && npm run dev`
- **Build for web**: `cd project && npm run build:web`
- **Lint code**: `cd project && npm run lint`
- **Install dependencies**: `cd project && npm install`

## Architecture & Key Components

### Directory Structure
- `project/` - Main Expo application directory
  - `app/` - Expo Router file-based routing
    - `(tabs)/` - Tab-based navigation screens
  - `components/` - Reusable UI components
  - `services/` - Business logic and data services
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `assets/` - Images and static assets

### Core Services & Data Layer
- **StorageService** (`services/storage.ts`): Centralized data management using AsyncStorage
  - Manages triggers, user settings, and achievements
  - Provides CRUD operations and data export/import functionality
  - Uses TypeScript interfaces: `Trigger`, `UserSettings`, `Achievement`

- **AnalyticsService** (`utils/analytics.ts`): Calculates user statistics and trends
  - Computes resistance rates, streaks, daily averages
  - Provides weekly trend analysis and best/worst day tracking

### Key Features & Components
- **Main Tracker Screen** (`app/(tabs)/index.tsx`): Primary interface for logging compulsions
  - Compulsion type selection grid
  - Resist/Give In action buttons with animations
  - Integrated coping toolbox with breathing exercises, grounding techniques, mantras
  - Success reminder system using previous resistance entries

- **Achievement System** (`hooks/useAchievements.ts`): Gamification through milestones
  - Tracks progress on resistance goals
  - Updates achievements automatically when triggers are logged

### Navigation & UI
- Uses Expo Router with tab-based navigation
- Custom icons from Lucide React Native
- Noto Sans JP font family for typography
- Haptic feedback integration (iOS/Android)
- Modal-based interfaces for coping tools and confirmations

### Data Persistence
- AsyncStorage for local data persistence
- JSON-based data structure with versioning for export/import
- TypeScript interfaces ensure type safety across data operations

## Development Notes

- The app uses Expo SDK 53 with React Native 0.79
- TypeScript is configured with strict mode enabled
- Path aliases configured: `@/*` maps to `./`
- No existing test framework is configured
- The codebase follows functional React patterns with hooks
- Uses React Native Reanimated for animations and transitions

## Project Specific Instruction from User

- "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make mobile app screens that are fully featured and worthy for production.

Implement haptic feedback and subtle animations on button press.

Focus on minimalist, distraction-free interface design."