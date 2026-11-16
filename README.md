# Cowpin MCP server: bookmark memory for Claude, Cursor and AI agents

[![npm](https://img.shields.io/npm/v/@cowpin/mcp-server?label=%40cowpin%2Fmcp-server)](https://www.npmjs.com/package/@cowpin/mcp-server)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-com.cowpin%2Fmcp--server-blue)](https://registry.modelcontextprotocol.io/v0/servers?search=com.cowpin)
[![Cowpin MCP server — Glama quality score](https://glama.ai/mcp/servers/cowpin-ai/mcp-server/badges/score.svg?v=1)](https://glama.ai/mcp/servers/cowpin-ai/mcp-server)

The official [Model Context Protocol](https://modelcontextprotocol.io/) server for **[Cowpin](https://www.cowpin.com)**, the
bookmark manager that keeps a readable copy of every page you save.

It gives your AI assistant a long-term memory of what you've read. It can save links, search **inside** the pages you
saved (not just their titles), pull the full archived text of a page back into the conversation, and write a cited
briefing across many saves. It works with Claude Desktop, Claude Code, Cursor, VS Code and any other MCP client.

```bash
npx -y @cowpin/mcp-server@latest
```

## What your assistant can do

| Tool | What it does |
| :--- | :--- |
| `cowpin_save_memory` | Save a link (or a piece of text) to your Cowpin library, with tags. Cowpin archives the page so it stays readable even if the site changes. |
| `cowpin_search_memory` | Search your library by meaning and by keyword, across the full text of saved pages. "What did I save about vector databases?" |
| `cowpin_get_cached_page` | Load the full archived text of one saved page, without visiting the site again. |
| `cowpin_synthesize_memories` | Write a briefing across many saved pages on a topic, with citations. |
| `cowpin_create_note` | Save a markdown note (meeting notes, a research write-up) to your library. |
| `cowpin_extract_url` | Read a live page as clean markdown, without saving it. |
| `cowpin_publish_to_feed` | Share a link with a summary on Cowpin's public feed (only when you ask it to). |
| `cowpin_post_comment` | Reply on a public feed item. |
| `cowpin_check_balance` | Show usage and credits for agent-wallet accounts. |

Everything you save is private unless you publish it.

## Quick start

### 1. Get your API token

Sign in at [cowpin.com](https://www.cowpin.com) (14-day free trial, no card), then open **Settings → API** and create a
token. Your account email must be verified.

Autonomous agents without a Cowpin account can use a wallet-based agent key (`cw_agent_…`) instead; see
[agent wallet auth](https://www.cowpin.com/docs/agent/crypto-auth).

### 2. Add Cowpin to your MCP client

**Claude Desktop**: edit `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "cowpin": {
      "command": "npx",
      "args": ["-y", "@cowpin/mcp-server@latest"],
      "env": { "COWPIN_API_KEY": "your-token-from-settings" }
    }
  }
}
```

**Claude Code**:

```bash
claude mcp add cowpin -e COWPIN_API_KEY=your-token-from-settings -- npx -y @cowpin/mcp-server@latest
```

**Cursor**: add the same block as Claude Desktop to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global).
Step-by-step guide: [Connect Cowpin to Cursor](https://www.cowpin.com/docs/agent/connect-cursor).

**VS Code**: add it under `"servers"` in `.vscode/mcp.json`, with `"type": "stdio"`.

### 3. Try it

> Save https://example.com/article to Cowpin with the tag "research".
>
> What have I saved about sorting algorithms? Summarize the three most relevant pages.

## Configuration

| Variable | Required | Description |
| :--- | :--- | :--- |
| `COWPIN_API_KEY` | Yes | Your API token from Settings → API (or a `cw_agent_…` agent key). `COWPIN_AGENT_API_KEY` also works. |
| `COWPIN_API_URL` | No | Defaults to `https://www.cowpin.com/api/agent/mcp`. |

## How it works

This package is a small, open-source stdio bridge. It forwards MCP JSON-RPC from your client to Cowpin's hosted MCP
endpoint over HTTPS, with your token. It stores nothing on your machine and contains no hidden keys; read
[`bin/cowpin-mcp.mjs`](https://github.com/cowpin-ai/mcp-server/blob/main/bin/cowpin-mcp.mjs).

Check it offline (runs the bridge against a mock gateway, no account needed):

```bash
npx -y @cowpin/mcp-server --self-test
```

From a checkout of [cowpin-ai/mcp-server](https://github.com/cowpin-ai/mcp-server): `npm test`.

## Listed in

- [Official MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=com.cowpin): `com.cowpin/mcp-server` (`server.json` in this package)
- [Glama](https://glama.ai/mcp/servers/cowpin-ai/mcp-server)
- [Smithery](https://smithery.ai): search `@cowpin/mcp-server` (`smithery.json` in this package)

## About Cowpin

[Cowpin](https://www.cowpin.com) is a bookmark manager and read-later app for people who save a lot. It's a
[Pinboard alternative](https://www.cowpin.com/migrate/pinboard) and imports from
[Pocket](https://www.cowpin.com/migrate/pocket), [Raindrop.io](https://www.cowpin.com/migrate/raindrop) and
Instapaper. Every save gets an archived copy you can search, read later or listen to, on the web, iPhone, Android,
Mac and in Chrome and Firefox.

Questions or problems: [open an issue](https://github.com/cowpin-ai/mcp-server/issues) or email help@cowpin.com.

## License

MIT
