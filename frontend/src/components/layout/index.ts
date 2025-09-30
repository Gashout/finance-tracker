/**
 * @file index.ts
 * @description Barrel file for layout components
 * 
 * This file exports all layout-related components from a single entry point,
 * simplifying imports throughout the application.
 * 
 * Benefits:
 * - Cleaner imports in other files
 * - Better organization of component code
 * - Easier maintenance and updates
 */

export { default as Header } from './Header'
export { default as Sidebar } from './Sidebar'
export { default as Layout } from './Layout'
