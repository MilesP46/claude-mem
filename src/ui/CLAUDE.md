# UI Memory

## Purpose & Entry Points

Frontend UI layer for claude-mem. Contains static assets (logos, icons) and the React viewer application. Built output goes to `plugin/ui/`.

- `viewer-template.html` - Base HTML template with CSS variables, theme support, and font loading
- `viewer/` - React application source (see CLAUDE.md)

## Patterns

- **Asset organization** - Logos as .webp, icons as .svg (thick/thin variants)
- **Theme variables** - CSS custom properties in viewer-template.html for light/dark modes
- **Build target** - Source in src/ui/, built to plugin/ui/

## Documented Subdirectories

- `viewer/` - React viewer application with components, hooks, and state management

**Other:** Static assets at this level (logos, icons)
