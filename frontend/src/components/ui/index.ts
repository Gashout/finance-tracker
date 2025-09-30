/**
 * @file index.ts
 * @description Barrel file for shadcn/ui components
 * 
 * This file exports all UI components from a single location, enabling:
 * 1. Cleaner imports in other files (import { Button, Input } from '@/components/ui')
 * 2. Better organization of component code
 * 3. Easier maintenance and updates
 * 
 * Barrel files are a pattern in JavaScript/TypeScript that consolidate exports
 * from multiple files into a single entry point, simplifying the import structure
 * throughout the application.
 */

// Re-export all UI components
export * from './alert';
export * from './badge';
export * from './button';
export * from './card';
export * from './dialog';
export * from './form';
export * from './input';
export * from './label';
export * from './table';

// Note: When adding new components, make sure to:
// 1. Create the component file in this directory
// 2. Add an export statement here
// 3. The component should be properly exported with named exports
