# Basic Starter

Minimal Next.js App Router template on standard Node.js. Keep dependencies and
startup work minimal. Add libraries only when the requested feature needs them.

- Use strict TypeScript and existing Next.js conventions.
- The initial `/` page displays only centered “clean slate”; replace it with the requested product.
- No theme, CSS framework, UI kit, fonts, authentication, database, or hosting adapter is configured.
- `project.json` owns generated app identity; `template.json` keeps template identity.
- Use `npm run dev -- --port <assigned-port>` for Fast Refresh. Do not rebuild for each edit.
- Run `npm run check` before delivery and verify affected routes.
- Preserve `/api/health` for preview readiness checks.
