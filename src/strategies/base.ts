import { AttackNode, ReasoningRequest, ReasoningResponse } from '../types.js';
import { StateManager } from '../state.js';

export interface StrategyMetrics {
  name: string;
  nodesExplored: number;
  averageScore: number;
  maxDepth: number;
  active?: boolean;
  [key: string]: number | string | boolean | undefined; // Allow additional strategy-specific metrics including booleans
}

export abstract class BaseStrategy {
  protected stateManager: StateManager;
  protected nodes: Map<string, AttackNode> = new Map();
  protected readonly minScore = 0.5;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.nodes = new Map();
  }

  abstract processAttackStep(request: ReasoningRequest): Promise<ReasoningResponse>;
  
  protected async getNode(id: string): Promise<AttackNode | undefined> {
    return this.nodes.get(id);
  }

  protected async saveNode(node: AttackNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  protected evaluateAttackStep(node: AttackNode, parent?: AttackNode): number {
    let score = this.minScore;

    // Base scoring
    score += this.calculateLogicalScore(node, parent);
    
    // Depth penalty
    score -= this.calculateDepthPenalty(node);

    // Parent coherence bonus
    if (parent) {
      score += this.calculateCoherence(parent.attackStep, node.attackStep);
    }

    return Math.min(Math.max(score, 0), 1);
  }

  private calculateLogicalScore(node: AttackNode, parent?: AttackNode): number {
    let score = 0;

    // Length score (up to 0.3)
    score += Math.min(node.attackStep.length / 200, 0.3);

    // Logical connectors
    if (/\b(therefore|because|if|then|thus|hence|so)\b/i.test(node.attackStep)) {
      score += 0.2;
    }

    // Technical content
    if (/[+\-*/=<>]/.test(node.attackStep)) {
      score += 0.2;
    }

    return score;
  }

  private calculateDepthPenalty(node: AttackNode): number {
    return Math.min((node.depth || 0) * 0.1, 0.3);
  }

  private calculateCoherence(parentAttackStep: string, childAttackStep: string): number {
    // Simple word overlap metric
    const parentTerms = new Set(parentAttackStep.toLowerCase().split(/\W+/));
    const childTerms = childAttackStep.toLowerCase().split(/\W+/);
    const overlap = childTerms.filter(term => parentTerms.has(term)).length;
    return Math.min(overlap * 0.1, 0.3);
  }

  // Required methods for all strategies
  public async getBestPath(): Promise<AttackNode[]> {
    const nodes = await this.stateManager.getAllNodes();
    if (nodes.length === 0) return [];

    // Default implementation - find highest scoring complete path
    const completedNodes = nodes.filter(n => n.isComplete)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    if (completedNodes.length === 0) return [];

    return this.stateManager.getPath(completedNodes[0].id);
  }

  public async getMetrics(): Promise<StrategyMetrics> {
    const nodes = await this.stateManager.getAllNodes();
    
    return {
      name: this.constructor.name,
      nodesExplored: nodes.length,
      averageScore: nodes.length > 0 
        ? nodes.reduce((sum, n) => sum + (n.score ?? 0), 0) / nodes.length 
        : 0,
      maxDepth: nodes.length > 0
        ? Math.max(...nodes.map(n => n.depth))
        : 0
    };
  }

  public async clear(): Promise<void> {
    // Optional cleanup method for strategies
    // Default implementation does nothing
  }
}
