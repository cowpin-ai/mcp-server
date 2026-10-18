# @cowpin/mcp-server

Official [Model Context Protocol](https://modelcontextprotocol.io/) stdio bridge for **[Cowpin](https://www.cowpin.com)** — persistent bookmark memory, URL archiving, and semantic search for **Cursor**, **Claude Desktop**, and other MCP clients.

[![Cowpin MCP server — Glama quality score](https://glama.ai/mcp/servers/cowpin-ai/mcp-server/badges/score.svg?v=1)](https://glama.ai/mcp/servers/cowpin-ai/mcp-server)

**Setup (Cursor):** [Connect Cowpin to Cursor](https://www.cowpin.com/docs/agent/connect-cursor)

## Install

```bash
npx -y @cowpin/mcp-server@latest
```

## Verify (offline — for directory reviewers)

Open-source stdio bridge with **no hosted secret**: runs JSON-RPC lines against a mock gateway.

```bash
npx -y @cowpin/mcp-server --self-test
```

From a git checkout of [cowpin-ai/mcp-server](https://github.com/cowpin-ai/mcp-server):

```bash
npm test
```

Tool calls against production require a `cw_agent_…` key ([crypto auth](https://www.cowpin.com/docs/agent/crypto-auth)); the bridge itself is fully inspectable in this repository.

## Environment

| Variable | Required | Description |
| :--- | :--- | :--- |
| `COWPIN_AGENT_API_KEY` | Yes (for tools) | `cw_agent_…` from [wallet auth](https://www.cowpin.com/docs/agent/crypto-auth) |
| `COWPIN_API_URL` | No | Default `https://www.cowpin.com/api/agent/mcp` |

## Cursor `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "cowpin": {
      "command": "npx",
      "args": ["-y", "@cowpin/mcp-server@latest"],
      "env": {
        "COWPIN_AGENT_API_KEY": "cw_agent_your_key_here"
      }
    }
  }
}
```

## Smithery

Registry config: `smithery.json` in this package. Listing: [smithery.ai](https://smithery.ai) — search `@cowpin/mcp-server`.

## License

MIT
