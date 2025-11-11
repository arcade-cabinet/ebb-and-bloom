/**
 * CONTROLLER ADAPTER
 * 
 * Interface for AI and Player input providers.
 * Each adapter provides input using different mechanisms:
 * - AIControllerAdapter: Uses YUKA steering behaviors
 * - PlayerControllerAdapter: Shows UI and waits for input
 */

import type { GovernorActionId, ActionContext, GovernorIntent } from './GovernorActionPort';

/**
 * Adapter interface for providing governor inputs
 */
export interface ControllerAdapter {
  /**
   * Provide input for a requested action
   * 
   * @param actionId - The action being requested
   * @param context - Current environmental and species context
   * @returns Promise resolving to the governor intent
   */
  provideInput(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent>;
  
  /**
   * Optional telemetry hook called when action starts
   */
  onActionStart?(actionId: GovernorActionId, context: ActionContext): void;
  
  /**
   * Optional telemetry hook called when action completes
   */
  onActionComplete?(intent: GovernorIntent): void;
  
  /**
   * Get adapter type identifier
   */
  getType(): 'ai' | 'player' | 'network' | 'replay';
}
