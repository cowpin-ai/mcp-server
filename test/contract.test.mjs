// Contract test for the stdio bridge: no network, no secrets. Run: node --test packages/mcp-server/test
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/cowpin-mcp.mjs", import.meta.url));

async function withGateway(handler, fn) {
  const seen = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ headers: req.headers, body: JSON.parse(body || "null") });
      const out = handler(seen.at(-1));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(out));
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}/api/agent/mcp`, seen);
  } finally {
    server.close();
  }
}

/** Send lines to the bridge, return the parsed JSON responses (one per line). */
async function talk(url, lines, env = {}) {
  const child = spawn(process.execPath, [BIN], { env: { ...process.env, COWPIN_API_URL: url, ...env }, stdio: ["pipe", "pipe", "pipe"] });
  let out = "";
  child.stdout.on("data", (c) => (out += c));
  child.stdin.end(lines.map((l) => (typeof l === "string" ? l : JSON.stringify(l))).join("\n") + "\n");
  await once(child, "close");
  return out.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

test("forwards JSON-RPC to the gateway and relays the answer", async () => {
  await withGateway((req) => ({ jsonrpc: "2.0", id: req.body.id, result: { echoed: req.body.method } }), async (url, seen) => {
    const [res] = await talk(url, [{ jsonrpc: "2.0", id: 7, method: "tools/list" }]);
    assert.deepEqual(res, { jsonrpc: "2.0", id: 7, result: { echoed: "tools/list" } });
    assert.equal(seen.length, 1);
  });
});

test("sends the key as Bearer and X-Agent-Key (works for agent keys and personal tokens)", async () => {
  await withGateway(() => ({ jsonrpc: "2.0", id: 1, result: {} }), async (url, seen) => {
    await talk(url, [{ jsonrpc: "2.0", id: 1, method: "ping" }], { COWPIN_AGENT_API_KEY: "cowpin_tok123" });
    assert.equal(seen[0].headers.authorization, "Bearer cowpin_tok123");
    assert.equal(seen[0].headers["x-agent-key"], "cowpin_tok123");
  });
});

test("falls back to COWPIN_API_KEY and sends no auth header when no key is set", async () => {
  await withGateway(() => ({ jsonrpc: "2.0", id: 1, result: {} }), async (url, seen) => {
    await talk(url, [{ jsonrpc: "2.0", id: 1, method: "ping" }], { COWPIN_AGENT_API_KEY: "", COWPIN_API_KEY: "k2" });
    await talk(url, [{ jsonrpc: "2.0", id: 1, method: "ping" }], { COWPIN_AGENT_API_KEY: "", COWPIN_API_KEY: "", AGENT_API_KEY: "" });
    assert.equal(seen[0].headers.authorization, "Bearer k2");
    assert.equal(seen[1].headers.authorization, undefined);
  });
});

test("answers garbage input with a JSON-RPC parse error instead of crashing", async () => {
  await withGateway((req) => ({ jsonrpc: "2.0", id: req.body.id, result: {} }), async (url, seen) => {
    const res = await talk(url, ["this is not json", { jsonrpc: "2.0", id: 2, method: "ping" }]);
    assert.equal(res[0].error.code, -32700);
    assert.equal(res[1].id, 2, "keeps serving after a bad line");
    assert.equal(seen.length, 1, "garbage is never forwarded");
  });
});

test("reports an unreachable gateway as a JSON-RPC error with the request id", async () => {
  const [res] = await talk("http://127.0.0.1:1/api/agent/mcp", [{ jsonrpc: "2.0", id: 9, method: "tools/list" }]);
  assert.equal(res.id, 9);
  assert.equal(res.error.code, -32603);
  assert.match(res.error.message, /Cowpin Remote Gateway Error/);
});

test("relays gateway auth errors untouched (so the client can show them)", async () => {
  await withGateway(() => ({ jsonrpc: "2.0", id: 3, error: { code: -32000, message: "Unauthorized: Invalid or revoked API token / agent key." } }), async (url) => {
    const [res] = await talk(url, [{ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "cowpin_search_memory" } }]);
    assert.equal(res.error.message, "Unauthorized: Invalid or revoked API token / agent key.");
  });
});

test("--self-test CLI runs this suite (directory reviewers)", () => {
  const r = spawnSync(process.execPath, [BIN, "--self-test"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
});
