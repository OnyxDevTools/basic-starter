# Basic Starter

Minimal Next.js App Router template on standard Node.js. Keep dependencies and
startup work minimal. Add libraries only when the requested feature needs them.

- Use strict TypeScript and existing Next.js conventions.
- The initial `/` page displays only centered “clean slate”; replace it with the requested product.
- No theme, CSS framework, UI kit, fonts, authentication or hosting adapter is configured. Onyx is available server-side through the explicit Task example.
- `project.json` owns generated app identity; `template.json` keeps template identity.
- Use `npm run dev -- --port <assigned-port>` for Fast Refresh. Do not rebuild for each edit.
- Run `npm run check` before delivery and verify affected routes.
- Preserve `/api/health` for preview readiness checks.

## Onyx persistence

Read `docs/onyx.md` before persistence changes. Keep SDK imports server-only,
externalized in Next, and lazy. Use the downloaded-config resolver; never expose
credentials or publish schemas during startup/build. `lib/onyx/tasks.ts` owns the
typed Task example. Authorize before using it in routes; use bounded pagination,
insert-only creation, filtered updates/deletes, and sanitized errors. No retries
or transaction guarantees for mutations. Run `npm run test:onyx`.
