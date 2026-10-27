import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { onyx } from "@onyx.dev/onyx-database";
import { createTasks } from "../lib/onyx/tasks.ts";
import { GET as readiness } from "../app/api/ready/route.ts";

test("official SDK: config file, CRUD, bounded cursor, validation and safe failures", async () => {
  const directory = await mkdtemp(join(tmpdir(), "onyx-sdk-test-"));
  const previousFetch = globalThis.fetch;
  const previousEnv = { ...process.env };
  const calls: { url: URL; init: RequestInit }[] = [];
  const replies: { status: number; body: unknown }[] = [];
  try {
    for (const key of Object.keys(process.env))
      if (key.startsWith("ONYX_")) delete process.env[key];
    const config = join(directory, "onyx-database.json");
    await writeFile(
      config,
      JSON.stringify({
        baseUrl: "http://fixture.invalid",
        databaseId: "test",
        apiKey: "test-key",
        apiSecret: "test-secret",
      }),
    );
    process.env.ONYX_CONFIG_PATH = config;
    onyx.clearCacheConfig();
    globalThis.fetch = async (input, init = {}) => {
      const url = new URL(String(input));
      assert.equal(
        url.hostname,
        "fixture.invalid",
        "test must never call a live database",
      );
      assert.equal(init.cache, "no-store");
      assert.ok(init.signal);
      calls.push({ url, init });
      const reply = replies.shift();
      assert.ok(reply, "unexpected SDK request");
      return new Response(JSON.stringify(reply.body), {
        status: reply.status,
        headers: { "content-type": "application/json" },
      });
    };
    const tasks = createTasks();
    replies.push({ status: 201, body: {} });
    const row = await tasks.create("  Example  ");
    assert.equal(row.title, "Example");
    assert.equal(row.completed, false);
    assert.equal(calls.at(-1)?.init.method, "POST");
    replies.push({ status: 200, body: row });
    assert.deepEqual(await tasks.get(row.id), row);
    replies.push({ status: 404, body: {} });
    assert.equal(await tasks.get("missing"), null);
    replies.push({
      status: 200,
      body: { records: [row], nextPage: "next-token" },
    });
    assert.deepEqual(await tasks.list(), {
      items: [row],
      cursor: "next-token",
    });
    assert.equal(calls.at(-1)?.url.searchParams.get("pageSize"), "20");
    replies.push({ status: 200, body: { records: [] } });
    await tasks.list("next-token");
    assert.equal(calls.at(-1)?.url.searchParams.get("nextPage"), "next-token");
    replies.push({ status: 200, body: 1 });
    assert.equal(await tasks.update(row.id, "Changed", true), true);
    replies.push({ status: 200, body: 0 });
    assert.equal(await tasks.update("missing", "Changed", true), false);
    replies.push({ status: 200, body: 1 });
    assert.equal(await tasks.remove(row.id), true);
    replies.push({ status: 200, body: 0 });
    assert.equal(await tasks.remove("missing"), false);
    const before = calls.length;
    await assert.rejects(tasks.create(" "));
    await assert.rejects(tasks.get("../invalid"));
    assert.equal(calls.length, before);
    replies.push({ status: 200, body: { ...row, completed: "invalid" } });
    await assert.rejects(tasks.get(row.id), /Onyx task operation failed/);
    const beforeFailure = calls.length;
    replies.push({
      status: 503,
      body: { message: "test-secret must not escape" },
    });
    await assert.rejects(
      tasks.list(),
      (error: unknown) =>
        error instanceof Error && !error.message.includes("test-secret"),
    );
    assert.equal(calls.length, beforeFailure + 1);
    assert.equal(replies.length, 0, "no automatic mutation/read retries");
    replies.push({ status: 200, body: { records: [] } });
    const ready = await readiness();
    assert.equal(ready.status, 200);
    assert.equal(ready.headers.get("cache-control"), "no-store");
    assert.deepEqual(await ready.json(), { status: "ready" });
    assert.equal(calls.at(-1)?.url.searchParams.get("pageSize"), "1");
    replies.push({ status: 503, body: { message: "test-secret" } });
    const unavailable = await readiness();
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: "unavailable" });
  } finally {
    globalThis.fetch = previousFetch;
    process.env = previousEnv;
    onyx.clearCacheConfig();
    await rm(directory, { recursive: true, force: true });
  }
});
