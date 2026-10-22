import { Router, Request, Response } from 'express';
import { mcpServerService, McpJsonRpcRequest } from '../services/mcp-server.service';

export const mcpRouter = Router();

mcpRouter.post('/', async (req: Request, res: Response) => {
  const jsonRpc = req.body as McpJsonRpcRequest;

  if (jsonRpc.method === 'tools/call') {
    try {
      const toolName = jsonRpc.params?.name;
      const args = jsonRpc.params?.arguments || {};
      const output = await mcpServerService.handleToolCall(toolName, args);

      return res.status(200).json({
        jsonrpc: '2.0',
        id: jsonRpc.id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
            },
          ],
        },
      });
    } catch (err: any) {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: jsonRpc.id,
        error: { code: -32603, message: err.message },
      });
    }
  }

  const response = mcpServerService.handleRequest(jsonRpc);
  return res.status(200).json(response);
});
