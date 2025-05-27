export class StateManager {
  constructor() {
    this.sessions = new Map();
  }

  async createSession(sessionId, params) {
    const state = {
      context: params.context,
      currentPaths: [],
      depth: 0,
      completed: false,
      assets: [] // Track assets involved in the session
    };

    this.sessions.set(sessionId, state);
    return state;
  }

  async getSession(sessionId) {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error('Session not found');
    }
    return state;
  }

  async updateSession(sessionId, newPaths) {
    const state = await this.getSession(sessionId);
    state.currentPaths = newPaths;
    state.depth += 1;
    state.completed = state.depth >= 3; // Max depth reached
    // Collect unique assets from newPaths
    state.assets = [
      ...new Set(
        newPaths.flatMap(p =>
          p.path && Array.isArray(p.path)
            ? p.path.map(step => step.asset).filter(Boolean)
            : []
        )
      )
    ];
    this.sessions.set(sessionId, state);
    return state;
  }

  async deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}