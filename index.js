#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

class ReasonerServer {
  constructor() {
    this.attackSteps = [];
    this.branches = {};
  }

  validateInput(input) {
    const data = input;
    if (!data.attackStep || typeof data.attackStep !== 'string') {
      throw new Error('Invalid attackStep: must be a string');
    }
    if (!data.attackStepNumber || typeof data.attackStepNumber !== 'number') {
      throw new Error('Invalid attackStepNumber: must be a number');
    }
    if (!data.totalAttackSteps || typeof data.totalAttackSteps !== 'number') {
      throw new Error('Invalid totalAttackSteps: must be a number');
    }
    if (typeof data.nextAttackStepNeeded !== 'boolean') {
      throw new Error('Invalid nextAttackStepNeeded: must be a boolean');
    }
    return true;
  }

  formatAttackStep(attackStepData) {
    const { attackStepNumber, totalAttackSteps, attackStep, asset, recommendedTool, critical } = attackStepData;
    const prefix = critical ? chalk.red('🔥 Critical Path') : chalk.blue('🛡️ Attack Step');
    const header = `${prefix} ${attackStepNumber}/${totalAttackSteps}`;
    const border = '─'.repeat(Math.max(header.length, attackStep.length) + 4);
    return `\n┌${border}┐\n│ ${header.padEnd(border.length - 2)} │\n├${border}┤\n│ ${attackStep.padEnd(border.length - 2)} │\n│ Target Asset: ${asset || 'N/A'}${' '.repeat(Math.max(0, border.length - 15 - (asset ? asset.length : 3)))}│\n│ Recommended Tool: ${recommendedTool || 'N/A'}${' '.repeat(Math.max(0, border.length - 22 - (recommendedTool ? recommendedTool.length : 3)))}│\n└${border}┘`;
  }

  processAttackStep(input) {
    try {
      this.validateInput(input);
      if (input.attackStepNumber > input.totalAttackSteps) {
        input.totalAttackSteps = input.attackStepNumber;
      }
      this.attackSteps.push(input);
      const formattedAttackStep = this.formatAttackStep(input);
      console.error(formattedAttackStep);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            attackStepNumber: input.attackStepNumber,
            totalAttackSteps: input.totalAttackSteps,
            nextAttackStepNeeded: input.nextAttackStepNeeded,
            attackStepCount: this.attackSteps.length,
            asset: input.asset,
            recommendedTool: input.recommendedTool,
            critical: input.critical || false
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error.message,
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

const REASONER_TOOL = {
  name: "pentestthinking",
  description: "A pentest reasoning engine that helps break down and analyze attack paths step by step",
  inputSchema: {
    type: "object",
    properties: {
      attackStep: {
        type: "string",
        description: "The current attack step description"
      },
      attackStepNumber: {
        type: "integer",
        description: "Current step number",
        minimum: 1
      },
      totalAttackSteps: {
        type: "integer",
        description: "Estimated total steps needed",
        minimum: 1
      },
      nextAttackStepNeeded: {
        type: "boolean",
        description: "Whether another step is needed"
      },
      asset: {
        type: "string",
        description: "Target asset for this step"
      },
      recommendedTool: {
        type: "string",
        description: "Recommended tool for this step"
      },
      critical: {
        type: "boolean",
        description: "Is this step part of the critical path?"
      }
    },
    required: ["attackStep", "attackStepNumber", "totalAttackSteps", "nextAttackStepNeeded"]
  }
};

// Initialize MCP server
const server = new Server(
  {
    name: "pentestthinkingMCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const reasonerServer = new ReasonerServer();

// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [REASONER_TOOL],
}));

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "pentestthinking") {
    return reasonerServer.processAttackStep(request.params.arguments);
  }
  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reasoner MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});