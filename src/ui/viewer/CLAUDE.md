# Viewer Memory

## Purpose & Entry Points

React-based viewer UI for claude-mem. Displays memory observations, summaries, and user prompts in a real-time feed. Served at http://localhost:37777, built to `plugin/ui/viewer.html`.

- `index.tsx` - React 18 entry point, mounts App with ErrorBoundary
- `App.tsx` - Main application component orchestrating hooks, state, and modals

## Patterns

- **Named exports** - Components and hooks use `export function` style
- **Hook composition** - App.tsx composes multiple custom hooks (useSSE, useSettings, usePagination, useTheme)
- **Memoized data** - useMemo for merging SSE live data with paginated data
- **TypeScript-first** - All components typed, shared types in `types.ts`

## Key APIs & Interactions

**Entry Points:**
- `App()` - Main component, manages filter state, modal toggles, paginated data merging
- `index.tsx` - createRoot render with ErrorBoundary wrapper

**Type Definitions (types.ts):**
- `Observation`, `Summary`, `UserPrompt` - Database record shapes
- `FeedItem` - Union type with `itemType` discriminator
- `Settings` - Full settings interface (provider config, token display, filtering)
- `Stats` - Worker and database statistics

**Data Flow:**
- SSE provides live updates (observations, summaries, prompts, processing status)
- Pagination loads historical data on scroll
- Filter changes reset paginated data and reload

## Dos & Don'ts

- DO use hooks from `./hooks/` for data fetching and state
- DO import shared types from `./types.ts`
- DO use constants from `./constants/` for API endpoints and defaults
- DON'T add class components (ErrorBoundary is the exception)
- DON'T inline business logic in components - extract to hooks

## Documented Subdirectories

- `components/` - React UI components (cards, modals, header, feed)
- `hooks/` - Custom React hooks (useSSE, useSettings, usePagination, useTheme)

**Other:** utils/ (data merging, formatters), constants/ (API endpoints, settings defaults, timing), assets/ (fonts)
