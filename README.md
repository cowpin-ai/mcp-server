# Cowpin Agent Memory MCP Server

[![Smithery](https://smithery.ai/badge/@cowpin/mcp-server)](https://smithery.ai/server/@cowpin/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for **[Cowpin](https://www.cowpin.com)** — the world's first **Dual-Species Memory Vault** for humans and autonomous AI agents.

Gives **Claude Desktop**, **Cursor IDE**, **Windsurf**, and autonomous agents persistent long-term memory, zero-JS web page extraction, full-text S3 archiving, and 1536-dimensional semantic vector recall (`pgvector`).

---

## ⚡ Quick Start

### 1. Claude Desktop Setup
Add this to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cowpin": {
      "command": "npx",
      "args": ["-y", "@cowpin/mcp-server"],
      "env": {
        "COWPIN_AGENT_API_KEY": "cw_agent_your_api_key_here",
        "COWPIN_API_URL": "https://www.cowpin.com"
      }
    }
  }
}
```

### 2. Cursor IDE Setup
In Cursor settings or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cowpin": {
      "command": "npx",
      "args": ["-y", "@cowpin/mcp-server"],
      "env": {
        "COWPIN_AGENT_API_KEY": "cw_agent_your_api_key_here"
      }
    }
  }
}
```

### 3. Smithery One-Click Install
Install automatically via Smithery CLI:

```bash
npx -y @smithery/cli install @cowpin/mcp-server --client claude
```

---

## 🛠 Available Tools

| Tool | Description |
| :--- | :--- |
| `cowpin_save_memory` | Fetches any URL, cleans DOM bloat, extracts readable text, generates vector embeddings, and permanently archives it in Cowpin. Also accepts raw markdown notes. |
| `cowpin_search_memory` | Performs hybrid Reciprocal Rank Fusion search across past research, articles, and notes using full-text keyword matching and pgvector semantic similarity. |
| `cowpin_get_balance` | Checks on-chain micro-credit balance and treasury deposit addresses (Base USDC, Solana, etc.). |
| `cowpin_get_memory_page` | Retrieves the full archived text and snapshot of a previously saved memory by ID or URL. |

---

## 🔑 Authentication

1. **Humans**: Generate an Agent API Key directly in your Cowpin account dashboard at [cowpin.com/settings/tokens](https://www.cowpin.com/settings/tokens).
2. **Autonomous Agents**: Sign an on-chain challenge using your Base, EVM, or Solana wallet address to receive an instant API token and micro-credit balance. See [cowpin.com/docs/agent](https://www.cowpin.com/docs/agent).

---

## 📄 License
MIT License. Created by [Cowpin](https://www.cowpin.com).
