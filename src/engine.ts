interface AttackNode {
    attackStep: string;
    attackStepNumber: number;
    totalAttackSteps: number;
    nextAttackStepNeeded: boolean;
    score?: number;
    children: AttackNode[];
    parent?: AttackNode;
}

export class Engine {
    private attackSteps: AttackNode[] = [];
    private readonly beamWidth = 3;
    private readonly minScore = 0.5;

    private evaluateAttackStep(attack: AttackNode): number {
        let score = 0.5; // Base score

        // Length heuristic - favor detailed steps
        score += Math.min(attack.attackStep.length / 100, 0.4);

        // Mathematical/technical content
        if (/[+\-*/=<>]/.test(attack.attackStep)) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    public addAttackStep(attackStep: string, attackStepNumber: number, totalAttackSteps: number, nextAttackStepNeeded: boolean): AttackNode {
        const node: AttackNode = {
            attackStep,
            attackStepNumber,
            totalAttackSteps,
            nextAttackStepNeeded,
            score: 0,
            children: []
        };

        // Evaluate attack step
        node.score = this.evaluateAttackStep(node);

        // Add to parent if this is not the first attack step
        if (this.attackSteps.length > 0) {
            const potentialParents = this.attackSteps.filter(t => t.attackStepNumber === attackStepNumber - 1);
            if (potentialParents.length > 0) {
                // Find best parent based on score
                const bestParent = potentialParents.reduce((a, b) => (a.score ?? 0) > (b.score ?? 0) ? a : b);
                node.parent = bestParent;
                bestParent.children.push(node);
            }
        }

        // Keep beam width best attack steps at each level
        const sameLevel = this.attackSteps.filter(t => t.attackStepNumber === attackStepNumber);
        sameLevel.push(node);
        if (sameLevel.length > this.beamWidth) {
            sameLevel.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
            sameLevel.splice(this.beamWidth);
        }

        this.attackSteps.push(node);
        return node;
    }

    public getBestPath(): AttackNode[] {
        const bestLast = [...this.attackSteps]
            .filter(t => !t.nextAttackStepNeeded)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

        if (!bestLast) return [];

        const path: AttackNode[] = [bestLast];
        let current = bestLast;
        while (current.parent) {
            path.unshift(current.parent);
            current = current.parent;
        }
        return path;
    }

    public getStats() {
        return {
            totalAttackSteps: this.attackSteps.length,
            bestScore: Math.max(...this.attackSteps.map(t => t.score ?? 0)),
            averageScore: this.attackSteps.reduce((a, b) => a + (b.score ?? 0), 0) / this.attackSteps.length,
            branchingFactor: this.attackSteps.reduce((a, b) => a + (b.children?.length ?? 0), 0) / this.attackSteps.length
        };
    }
}