# Pentest Thinking MCP
A systematic penetration testing MCP server implementation for Claude Desktop featuring both Beam Search and Monte Carlo Tree Search (MCTS) capabilities for attack pathfinding and vulnerability analysis.

## Features
* Dual search strategies for attack modeling:
   * Beam search with configurable width (for methodical exploit chain discovery)
   * MCTS for complex decision spaces (for dynamic attack scenarios with unknowns)
* Evidence/Vulnerability scoring and evaluation
* Tree-based attack path analysis
* Statistical analysis of potential attack vectors
* MCP protocol compliance

## Installation
```
git clone https://github.com/Jacck/pentestthinkingMCP.git
cd pentestthinkingMCP
npm install
npm run build
```

## Configuration
Add to Claude Desktop config:
```
{
  "mcpServers": {
    "pentestthinking": {
      "command": "node",
      "args": ["path/to/pentest-thinking-mcp/dist/index.js"],
    }
  }
}
```

## Search Strategies for Pentesting

### Beam Search
* Maintains a fixed-width set of the most promising attack paths or vulnerability chains.
* Optimal for step-by-step exploit development and known vulnerability pattern matching.
* Best for: Enumerating attack vectors, methodical vulnerability chaining, logical exploit pathfinding.

### Monte Carlo Tree Search
* Simulation-based exploration of the potential attack surface.
* Balances exploration of novel attack vectors and exploitation of known weaknesses.
* Best for: Complex network penetration tests, scenarios with uncertain outcomes, advanced persistent threat (APT) simulation.

**Note:** Monte Carlo Tree Search can help Claude to identify complex, multi-stage attack paths that might be less obvious, whereas beam search is excellent for systematically exploring known patterns. For highly complex or evasive maneuvers, you'd want to direct Claude to utilize the MCTS strategy.

## Algorithm Details
1. Attack Vector Selection
   * Beam Search: Evaluates and ranks multiple potential attack paths or exploit chains.
   * MCTS: Uses UCT for node selection (potential exploit steps) and random rollouts (simulating attack progression).
2. Evidence/Vulnerability Scoring Based On:
   * Likelihood of exploitability
   * Potential impact (CIA triad)
   * CVSS scores or similar metrics
   * Strength of connection in an attack chain (e.g., vulnerability A enables exploit B)
3. Process Management
   * Tree-based state tracking of attack progression
   * Statistical analysis of successful/failed simulated attack paths
   * Progress monitoring against pentest objectives

## Use Cases
* Automated vulnerability identification and chaining
* Exploit pathfinding and optimization
* Attack scenario simulation and "what-if" analysis
* Red teaming strategy development and refinement
* Assisting in manual pentesting by suggesting potential avenues
* Decision tree exploration for complex attack vectors
* Strategy optimization for achieving specific pentest goals (e.g., data exfiltration, privilege escalation)

## Future Implementations
* Implement New Attack Modules/Techniques
* Support for specific pentesting frameworks (e.g., Metasploit integration)
* Automated report generation snippets based on findings

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
