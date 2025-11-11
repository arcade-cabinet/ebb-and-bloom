import type { GovernorActionPort, GovernorIntent, ActionContext, GovernorActionId } from '../../agents/controllers/GovernorActionPort';
import { GOVERNOR_ACTION_COSTS } from '../../agents/controllers/GovernorActionPort';

export class PlayerGovernorController implements GovernorActionPort {
  async requestAction(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent> {
    const cost = GOVERNOR_ACTION_COSTS[actionId];
    if (context.energyAvailable < cost) {
      throw new Error(`Insufficient energy: need ${cost}, have ${context.energyAvailable}`);
    }

    return {
      type: actionId,
      target: context.validPositions?.[0] || context.availablePrey?.[0],
      magnitude: 1.0,
      metadata: {
        reasoning: 'Player direct control',
        confidence: 1.0,
      },
    };
  }
}
