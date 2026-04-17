# App Architecture

## Layering

- `app/routes/*`: route entry files only. Keep them thin and limited to `loader`, `action`, `meta`, and the route component shell.
- `app/pages/<page>/*`: page-owned code. Prefer this for page composition, view-model mapping, server access, and page-local UI.
- `app/components/ui/*`: shared primitive UI components.
- `app/components/*`: shared cross-page components that are not page-owned.
- `app/hooks/*`: the single home for application hooks. Group by page module under this directory when needed.
- `app/lib/*`: framework-agnostic utilities used across multiple features.

## Feature Shape

Use the same folders for each page module when they become necessary:

- `pages/`: page entry components used by route shells
- `components/`: page-local presentational components
- `data/`: static fixtures, seeds, and mock data
- `services/`: data access, adapters, and business orchestration
- `types/`: page-owned type definitions
- `loaders/`: route loader helpers used by route entry files

## Naming

- Use `kebab-case` for filenames and folders.
- Use `PascalCase` for React component names.
- Use `camelCase` for variables, hooks, and service functions.
- Prefer singular page module names unless the domain naturally reads better in plural form.

## Imports

- Use `@/` for app-internal TypeScript and TSX imports.
- Keep relative imports for generated route type modules such as `./+types/home`.
- Relative imports are also acceptable for colocated assets and styles.
- Avoid reaching across page modules with deep relative paths.
