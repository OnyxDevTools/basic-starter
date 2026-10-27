# Basic Starter

A minimal Next.js App Router app. One page displays **clean slate** centered in
the viewport using browser defaults. No theme, UI library, CSS framework, custom
fonts, external services, or client components.

Requires Node.js 22.18+ and npm.

```sh
npm ci
npm run dev -- --port 3000
```

Open http://127.0.0.1:3000. Next.js uses Turbopack and Fast Refresh by default:
edit `app/page.tsx` or `app/globals.css` and the running preview updates.
No production build is needed between edits. Application code stays in strict
TypeScript. The small JavaScript config avoids TypeScript config transpilation at
startup; automatic agent-instruction writes are disabled.

```sh
npm run check
npm run start -- --port 3000
```

`check` builds the production app and checks TypeScript. `start` serves that build;
production changes require a new build and process restart.

## Onyx integration

`template.json` follows the sister admin-starter's repository-owned selection
metadata convention. It is not an official Onyx API schema.

1. Copy clean source, excluding `.git`, `node_modules`, `.next`, local `.env` files,
   and `*.tsbuildinfo`. Preserve the lockfile.
2. Run `npm ci` (cache npm downloads by lockfile hash for faster installs).
3. Optionally initialize identity before starting or building:
   `npm run template:init -- --name "My App" --slug my-app`.
4. Assign a free port and run `npm run dev -- --port <assigned-port>`.
5. Wait for `/api/health` to return HTTP 200 with `status: "ok"` and the project
   slug in `application`. Onyx owns preview proxying and process isolation.
6. Edit source in the same running process for hot updates. A preview proxy must
   forward WebSocket upgrades for Fast Refresh.

Both dev and production servers bind to loopback by default. For a container that
requires an externally reachable listener, append `--hostname 0.0.0.0` explicitly.
Configure allowed development origins if your preview proxy requires them.
No hosting-specific deployment adapter or remote hot-deployment service is included.

`project.json` owns app identity (browser title and health response).
`template.json` always retains the `basic-starter` catalog identity.

## Repository contents

Commit the source, configuration, template metadata, and `package-lock.json`.
`.gitignore` excludes installed dependencies, build output, generated TypeScript
files, local environment files, credentials, logs, caches, and editor state.
Next.js regenerates `next-env.d.ts` when you run dev or build. A sanitized
`.env.example` may be committed if configuration is added later.

## Onyx Database SDK

The official SDK and typed one-table Task CRUD example are included. See
[Onyx setup and example](docs/onyx.md) for downloaded configuration, explicit
schema commands, CLI CRUD, and authorization boundaries. UI startup needs no credentials.
