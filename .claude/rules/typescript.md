---
paths: src/**/*.ts, src/**/*.tsx, app/**/*.tsx
---

# TypeScript Rules

## Type Definitions
- Always define explicit types for function parameters and return values
- Use `type` for object shapes, `interface` for extendable contracts
- Avoid `any` - use `unknown` if type is truly unknown

## Imports
- Use absolute imports from `src/` when possible
- Group imports: React, external libs, internal modules, types
- Use type-only imports: `import type { Foo } from './types'`

## Naming Conventions
- PascalCase: Components, Types, Interfaces
- camelCase: functions, variables, hooks
- SCREAMING_SNAKE_CASE: constants only

## State Management
- Use Zustand for global state (`src/stores/`)
- Use React Context for theme/localization
- Use local state for component-specific UI state

## Error Handling
- Always handle Promise rejections
- Use try-catch for async operations
- Log errors with `console.error('[ModuleName]', error)`
