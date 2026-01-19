/**
 * Seed Profiles Index
 *
 * Export all available seed profiles for the CLI orchestrator
 */

export { seed as testing } from './testing.js';
export { seed as demo } from './demo.js';
export { seed as inspection } from './inspection.js';

/**
 * Available profile names for CLI validation
 */
export const AVAILABLE_PROFILES = ['testing', 'demo', 'inspection'];

/**
 * Default profile when none specified
 */
export const DEFAULT_PROFILE = 'demo';
