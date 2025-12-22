---
name: typecheck
description: Run TypeScript type checking
---

Run TypeScript type checking for the project.

```bash
npx tsc --noEmit
```

## Common Type Issues

1. **Missing types** - Add to `src/types/index.ts`
2. **Theme types** - Ensure `useTheme()` is imported from correct path
3. **Native module types** - Check `src/native/ScreenTimeModule.ts`

## Fix All Issues

If many errors, fix iteratively:
1. Run typecheck
2. Fix first error
3. Repeat until clean
