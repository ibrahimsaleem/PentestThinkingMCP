export interface AttackNode {
  id: string;
  attackStep: string;
  depth: number;
  score?: number;
  isComplete?: boolean;
  children?: AttackNode[];
  parent?: AttackNode;
}

export interface ReasoningRequest {
  attackStep: string;
  attackStepNumber: number;
  totalAttackSteps: number;
  nextAttackStepNeeded: boolean;
  parentId?: string;
  strategyType?: string;
}

export interface ReasoningResponse {
  nodeId: string;
  attackStep: string;
  score: number;
  strategyUsed: string;
  nextAttackStepNeeded: boolean;
}

export interface ReasoningStats {
  totalNodes: number;
  averageScore: number;
  maxDepth: number;
  branchingFactor: number;
  strategyMetrics: Record<string, any>;
}

export const CONFIG = {
  beamWidth: 5,
  maxDepth: 10,
  mctsIterations: 50,
  temperature: 0.7, // For attack step diversity
  cacheSize: 1000,
  defaultStrategy: 'beam_search'
} as const;

export enum ReasoningStrategy {
  BEAM_SEARCH = 'beam_search',
  MCTS = 'mcts'
}
