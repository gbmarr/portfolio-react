# TypeScript Code Style Guide

This guide defines TypeScript-specific coding standards for the project.

## Type Safety

- Prefer `type` aliases for unions and object shapes; use `interface` for contracts that may be extended.
- Avoid `any`. Use `unknown` when the type is truly unknown, then narrow it.
- Enable strict mode: `"strict": true` in `tsconfig.json`.
- Use `const` for values that never change; `readonly` for properties/arrays that should not be mutated.
- Do not use non-null assertions (`!`) as a default; narrow types properly instead.

## Naming

- **Variables/functions:** `camelCase`
- **Types/classes/interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE` for module-level constants.
- **Files:** `kebab-case` for files (e.g., `contact-form.tsx`), matching component names.

## Imports & Exports

- Use explicit named exports over default exports for better refactoring support.
- Order imports: external libraries first, then internal modules, then relative imports.
- Do not import unused members; enable `noUnusedLocals` and `noUnusedParameters`.

## React-Specific (when used)

- Define props as `interface ComponentProps { ... }` and type components as `React.FC<ComponentProps>` or a plain function with typed props.
- Use `React.ReactNode` for children props.

## Anti-patterns (Avoid)

- Type assertions (`as`) used to bypass type checking.
- Enums when `as const` objects or union types are simpler.
- Importing entire libraries when tree-shaken named imports exist.
