# Onyx Database example

The official TypeScript SDK is pinned to **2.8.4** (latest verified 2026-10-26).
`lib/onyx/client.ts` resolves credentials through the official SDK, creates the
client lazily, disables payload logging and mutation retries, and bounds requests
to eight seconds. Next externalizes the SDK to preserve downloaded-config resolution.
Nothing contacts the database during a normal build or clean-slate startup.

## Setup

1. Run `npm ci`.
2. Download a configuration for your development database from Onyx. Place it at
   project-root `onyx-database.json`, or use the SDK's existing `ONYX_CONFIG_PATH`
   if your configuration already lives elsewhere. Both the file and `config/`
   are ignored. Never use `NEXT_PUBLIC_` credentials or commit downloaded config.
3. Inspect `api/onyx.schema.json`: one Task table (`id`, `title`, `completed`).
   Use a separate development database per starter; API Starter's richer Task
   schema is independent. Onyx 4.2.9+ is required for insert-only creation.
4. Run `npm run schema:validate` (local), then `npm run schema:diff` (remote).
5. Review the diff and explicitly run `npm run schema:publish` against the intended
   database. Missing tables are added; unrelated tables and existing definitions
   are preserved. Incompatible existing attributes fail for manual review.

Schema publication never runs at startup or build time. It is a development
administration operation; concurrent schema changes require coordination.

## Small CRUD example

```sh
npm run onyx:tasks -- create "Try Onyx"
npm run onyx:tasks -- list
npm run onyx:tasks -- get <id>
npm run onyx:tasks -- update <id> "Try Onyx again" true
npm run onyx:tasks -- delete <id>
```

Create prints the new ID. List returns at most 20 rows and a cursor; pass that
cursor as `npm run onyx:tasks -- list <cursor>` for the next page. Creation is
insert-only with a random ID, update/delete use filtered affected counts, and
missing get returns null. Edits are last-write-wins; no transaction or atomic
compare-and-swap is claimed. There are no automatic mutation retries.

Reuse `createTasks()` from `lib/onyx/tasks.ts` in a **server-only** service,
Server Component, or handler after implementing your application's authorization.
Do not expose these privileged operations directly to anonymous browsers. This
starter adds no auth bypass or public CRUD endpoint. CLI commands run with the
operator's database credentials and perform real writes only when requested.
The existing UI remains independent of this example.

`npm run test:onyx` exercises actual SDK CRUD and pagination against an explicit
in-process test transport; it never uses a live database. No live credentials
were available during implementation. Verify the commands above against your
authorized development database before deploying a connected application.

`/api/health` remains independent of database setup. `/api/ready` performs a
bounded read-only one-row ID query and returns 200 when available or 503 without
configuration/schema/connectivity. It never returns data or raw SDK errors and
disables response caching.
