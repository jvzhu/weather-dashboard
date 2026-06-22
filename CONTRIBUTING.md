# Contributing Guide

Thank you for your interest in contributing to the weather dashboard!

---

## Development Setup

**Prerequisites:** Node.js 20+ and npm 10+.

```bash
git clone https://github.com/<username>/weather-dashboard.git
cd weather-dashboard
npm install
npm run dev        # Start the dev server at http://localhost:5173
```

---

## Available Scripts

| Command              | Description                                       |
|----------------------|---------------------------------------------------|
| `npm run dev`        | Start Vite development server with HMR            |
| `npm run build`      | Type-check and produce a production build         |
| `npm run preview`    | Serve the production build locally                |
| `npm run lint`       | Run ESLint across all TypeScript/TSX files        |
| `npm run typecheck`  | Run `tsc --noEmit` for type safety                |
| `npm test`           | Run the Vitest test suite in watch mode           |
| `npm run coverage`   | Run tests and generate a coverage report          |

---

## Code Style Guidelines

- **TypeScript strict mode** is enabled. All code must be fully typed; avoid `any`.
- **ESLint** enforces React Hooks rules and react-refresh constraints. Run `npm run lint` before committing.
- **Formatting:** no formatter is enforced — match the style of surrounding code (2-space indent, single quotes, trailing commas).
- **Imports:** use `.ts`/`.tsx` extensions in import paths (required by `verbatimModuleSyntax`).
- **Components:** export named components (`export const Foo = ...`); default exports are reserved for page-level components.
- Apply `React.memo` to pure presentational components that receive only primitive or stable-reference props.

---

## Testing Requirements

All changes to logic or components must be accompanied by tests.

- **Test files** live in `src/tests/` (unit tests) and `src/tests/components/` (component tests).
- **Framework:** Vitest + React Testing Library.
- Tests must pass (`npm test -- --run`) before a PR is opened.
- Aim for meaningful assertions over coverage percentages — test behaviour, not implementation.

### Running tests

```bash
npm test              # watch mode
npm run coverage      # single run + coverage report
```

---

## PR Process

1. **Fork** the repository and create a feature branch from `main`.
2. Make your changes with focused, atomic commits.
3. Ensure `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test -- --run` all pass.
4. Open a pull request against `main` with a clear description of what changed and why.
5. Address any review feedback; the CI checks must be green before merging.
