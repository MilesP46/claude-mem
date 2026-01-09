# Viewer Hooks Memory

## Purpose & Entry Points

React custom hooks for the Viewer UI. Manages data fetching, real-time updates, settings persistence, and UI state.

Entry point: Import individual hooks as needed from this directory.

## Patterns

- Named exports only (one hook per file)
- Hook naming: `use{Feature}.ts` pattern
- API calls use `API_ENDPOINTS` constants from `../constants/api`
- State pattern: `useState` + `useEffect` for data fetching with loading/error states
- Refs for mutable values that shouldn't trigger re-renders (`useRef`)

## Key APIs & Interactions

**Data Hooks:**
- `useSettings()` - Load/save settings via `/api/settings` endpoint
- `useSSE()` - Real-time EventSource connection for observations, summaries, prompts, processing status
- `usePagination(filter)` - Paginated loading for observations/summaries/prompts
- `useStats()` - Fetch database stats from `/api/stats`
- `useContextPreview(settings)` - Preview context with project selection

**UI Hooks:**
- `useTheme()` - Theme preference (system/light/dark) with localStorage persistence
- `useSpinningFavicon(isProcessing)` - Animated favicon during processing
- `useGitHubStars(username, repo)` - Fetch GitHub star count

**Dependencies:** Types from `../types`, constants from `../constants/`

## Dos & Don'ts

- DO use `useCallback` for functions passed to useEffect dependencies
- DO cleanup EventSource/timeouts in useEffect return
- DO handle loading/error states for all async operations
- DON'T access localStorage without try/catch (may be blocked)
- DON'T forget to clear timeouts on component unmount
