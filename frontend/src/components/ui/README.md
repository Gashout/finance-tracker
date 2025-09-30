# UI Components

This directory contains all the reusable UI components for the Finance Tracker application, built using shadcn/ui.

## Component Organization

The components are organized as follows:

1. Each component has its own file (e.g., `button.tsx`, `input.tsx`)
2. All components are re-exported from `index.ts` for easier imports
3. Components follow the shadcn/ui patterns and styling conventions

## Import Pattern

To use these components in your application, import them using the path alias:

```tsx
import { Button, Input, Card } from '@/components/ui';
```

This is made possible by:
1. The barrel file (`index.ts`) that re-exports all components
2. The path alias configuration in `tsconfig.json`

## Available Components

- `Alert`: For displaying important messages to users
- `Badge`: For displaying status indicators or tags
- `Button`: For user interactions
- `Card`: Container component for grouping related content
- `Dialog`: For modal dialogs and popups
- `Form`: Form components with validation integration
- `Input`: Text input fields
- `Label`: Form labels
- `Table`: Data display in tabular format

## Adding New Components

When adding a new component:

1. Create a new file for your component (e.g., `dropdown.tsx`)
2. Export the component using named exports
3. Add the component to the `index.ts` barrel file
4. Use proper TypeScript typing for props and state

## Component Documentation

Each component should be documented with:
- A clear description of its purpose
- Examples of how to use it
- Props documentation
- Any special considerations or edge cases

## Styling

Components use Tailwind CSS for styling, following the shadcn/ui theming system with CSS variables for colors and other design tokens.

## Best Practices

1. Keep components small and focused on a single responsibility
2. Use composition over inheritance
3. Ensure components are accessible (proper ARIA attributes, keyboard navigation)
4. Test components for edge cases and different states
5. Document any non-obvious behavior or usage patterns
