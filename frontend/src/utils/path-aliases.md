# Path Aliases in TypeScript Projects

## What are Path Aliases?

Path aliases are a TypeScript feature that allows you to create shortcuts for import paths. Instead of using relative paths like `../../../components/ui/Button`, you can use a shorter, more readable path like `@/components/ui/Button`.

## Benefits of Path Aliases

1. **Cleaner imports**: Shorter import statements make code more readable.
2. **Easier refactoring**: When you move files around, you don't need to update all the relative imports.
3. **Consistent imports**: All imports follow the same pattern, regardless of file location.
4. **Better organization**: Encourages a more organized project structure.
5. **Reduced errors**: Eliminates counting directory levels in deep imports.

## How Path Aliases Work in This Project

In our project, we've configured path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

This configuration tells TypeScript to:
- Use the project root as the base directory for resolving non-relative imports (`baseUrl: "."`)
- Map any import starting with `@/` to the corresponding path under the `src/` directory

## Import Resolution Process

When you write an import statement like:

```typescript
import { Button } from '@/components/ui';
```

The following happens:

1. TypeScript sees the `@/` prefix and checks the `paths` configuration in `tsconfig.json`
2. It finds that `@/*` maps to `src/*`
3. It replaces `@/components/ui` with `src/components/ui`
4. It looks for exports in `src/components/ui` (which may be a file or a directory with an index file)
5. If it finds the exports, it imports them; otherwise, it reports an error

## Barrel Files and Path Aliases

We use barrel files (like `src/components/ui/index.ts`) to re-export components from a single location. This works well with path aliases to create clean imports:

```typescript
// Without barrel files and path aliases
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

// With barrel files but without path aliases
import { Button, Input } from '../../../components/ui';

// With barrel files and path aliases (best approach)
import { Button, Input } from '@/components/ui';
```

## Troubleshooting Path Aliases

If you encounter issues with path aliases:

1. Make sure `tsconfig.json` is properly configured
2. Verify that the import path exists (e.g., `src/components/ui` should exist)
3. Check that the component is properly exported from the file
4. For barrel files, ensure the component is re-exported in the index file
5. Some build tools might need additional configuration to understand path aliases

## Best Practices

1. Use path aliases for imports from outside the current directory
2. Use relative imports for files in the same or adjacent directories
3. Keep your barrel files up to date when adding new components
4. Document your path alias conventions for new team members
