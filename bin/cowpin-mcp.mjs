#!/usr/bin/env node
/**
 * @cowpin/mcp-server — Official Stdio bridge for Claude Desktop, Cursor, & MCP Clients.
 *
 * Usage:
 *   npx @cowpin/mcp-server
 *   npx @cowpin/mcp-server --self-test   # offline contract checks (no network, no secrets)
 *
 * Environment Variables:
 *   COWPIN_AGENT_API_KEY / COWPIN_API_KEY: Your Agent API Key (e.g. cw_agent_...)
 *   COWPIN_API_URL: Optional override (default: https://www.cowpin.com/api/agent/mcp)
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

if (
  process.argv.includes("--self-test") ||
  process.env.COWPIN_MCP_SELF_TEST === "1"
) {
  const testFile = fileURLToPath(new URL("../test/contract.test.mjs", import.meta.url));
  const result = spawnSync(process.execPath, ["--test", testFile], { stdio: "inherit" });
  process.exit(result.status === 0 ? 0 : result.status ?? 1);
}

const apiKey =
  process.env.COWPIN_AGENT_API_KEY ||
  process.env.COWPIN_API_KEY ||
  process.env.AGENT_API_KEY ||
  "";

const apiUrl =
  process.env.COWPIN_API_URL || "https://www.cowpin.com/api/agent/mcp";

// Update notice (COW-154): stdout is the MCP channel, so only stderr. Clients started with
// "npx -y @cowpin/mcp-server@latest" fetch the newest version on every launch anyway.
const MCP_VERSION = JSON.parse(
  (await import("node:fs")).readFileSync(new URL("../package.json", import.meta.url), "utf8"),
).version;
if (process.env.COWPIN_NO_UPDATE_CHECK !== "1") {
  fetch(process.env.COWPIN_UPDATE_FEED || "https://www.cowpin.com/downloads/cli.json", { signal: AbortSignal.timeout(1500) })
    .then((r) => (r.ok ? r.json() : null))
    .then((feed) => {
      const latest = feed?.mcpServer?.version;
      const n = (v) => String(v).split(".").map((x) => Number.parseInt(x, 10) || 0);
      const [a, b] = [n(latest), n(MCP_VERSION)];
      const newer = latest && (a[0] - b[0] || a[1] - b[1] || a[2] - b[2]) > 0;
      if (newer) process.stderr.write(`[cowpin-mcp] ${latest} is available (running ${MCP_VERSION}). Use "npx -y @cowpin/mcp-server@latest" to always get the newest.\n`);
    })
    .catch(() => {});
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

async function handleMessage(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch (err) {
    sendResponse({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
    return;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["X-Agent-Key"] = apiKey;
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const data = await res.json();
    sendResponse(data);
  } catch (error) {
    sendResponse({
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: {
        code: -32603,
        message: `Cowpin Remote Gateway Error: ${error.message || String(error)}`,
      },
    });
  }
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

rl.on("line", (line) => {
  handleMessage(line).catch((err) => {
    sendResponse({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: `Fatal Error: ${err.message}` },
    });
  });
});
