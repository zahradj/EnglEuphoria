/**
 * @adapter
 * Backward-compatibility re-export for EnhancedVideoService.
 *
 * This file exists to preserve existing import paths across the codebase.
 * The real implementation lives in src/services/video/enhancedVideoService.ts.
 *
 * Do NOT add logic here. Update the source file directly.
 */
export { EnhancedVideoService } from './video/enhancedVideoService';
export type { EnhancedVideoConfig, ParticipantData } from './video/types';
