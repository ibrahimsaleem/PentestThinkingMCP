declare module '@modelcontextprotocol/sdk/server/index.js' {
  export class Server {
    constructor(info: { name: string; version: string }, config: { capabilities: { tools: {} } });
    setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  }

  export const CallToolRequestSchema: {
    params: {
      name: string;
      arguments: any;
    };
  };

  export const ListToolsRequestSchema: {
    params: any;
  };
}