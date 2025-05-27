import { ReasoningStrategy } from '../types.js';
import { BeamSearchStrategy } from './beam-search.js';
import { MCTSStrategy } from './mcts.js';
import { StateManager } from '../state.js';

export { ReasoningStrategy };

export class StrategyFactory {
  static createStrategy(strategy: ReasoningStrategy, stateManager: StateManager) {
    switch (strategy) {
      case ReasoningStrategy.BEAM_SEARCH:
        return new BeamSearchStrategy(stateManager);
      case ReasoningStrategy.MCTS:
        return new MCTSStrategy(stateManager);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }
}
