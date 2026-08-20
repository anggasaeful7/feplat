# Superadmin Portal — `frontend-platform-control`

The operator console for the IPL platform. Provides a single pane of glass for
provisioning tenant workspaces, managing platform users, and monitoring health
across the fleet. Sign-in is gated to **superadministrators only**.

This frontend pairs with the [`backend-platform-control`](http://localhost:8080/swagger/index.html)
microservice; every page is wired to its REST API.

## Stack

| Concern              | Choice                                  |
| -------------------- | --------------------------------------- |
| Framework            | Next.js 16 (App Router) + Turbopack     |
| UI library           | React 19                                |
| Styling              | Tailwind CSS 4 (`@theme inline`)        |
| Language             | TypeScript (strict)                     |
| Auth transport       | HttpOnly cookie storing the backend JWT |
| Data fetching        | Server Components + Server Actions      |
| Form interactivity   | `useActionState` (React 19)             |

No client-side state library, no custom auth library, no ORM. Just the
framework, used as intended.

## Quick start

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The root `/` redirects
to `/login`. After a successful login the app lands on `/workspaces`.

### Other scripts

```bash
npm run build   # Turbopack production build + TS check
npm run start   # Run the production server
npm run lint    # ESLint (eslint-config-next)
```

## Configuration

The frontend reads a single environment variable:

| Variable                 | Required | Default                          | Notes                                     |
| ------------------------ | -------- | -------------------------------- | ----------------------------------------- |
| `PLATFORM_API_BASE_URL`  | no       | `http://localhost:8080/api/v1`   | Server-only. Never exposed to the browser. |

Drop it in `.env.local` for staging/production:

```bash
# .env.local
PLATFORM_API_BASE_URL=https://api.staging.example.com/api/v1
```

## Architecture

### Auth — HttpOnly proxy pattern

Every authenticated call goes **through Next**, never browser → backend
directly. The flow:

```
browser  →  Next route handler / Server Component / Server Action
                              ↓ adds Authorization header
                        backend-platform-control
```

- `POST /api/auth/login` ([app/api/auth/login/route.ts](app/api/auth/login/route.ts))
  forwards credentials to the backend, **rejects any user whose `role !== "superadmin"`**,
  and stores the JWT as an HttpOnly + SameSite=Lax + (in prod) Secure cookie
  named `spc_session`.
- `POST /api/auth/logout` clears the cookie.
- Every server-side fetch ([lib/api/server.ts](lib/api/server.ts)) reads the
  cookie via `next/headers`, attaches `Authorization: Bearer <jwt>`, and
  unwraps the `{data,error}` envelope into a typed `APIRequestError` on
  failure.

The browser never sees the JWT, the backend host stays private, and the
superadmin guard runs server-side so it can't be bypassed by a curious
client.

### Routing

```
app/
├── (auth)/
│   └── login/                      ← split-screen sign-in
├── (dashboard)/                    ← shared sidebar + topbar layout
│   ├── dashboard/                  ← overview (placeholder)
│   ├── workspaces/                 ← list + filter (real data)
│   │   ├── new/                    ← create form
│   │   └── [id]/edit/              ← edit form + danger zone
│   ├── user-access/                ← table + drawer-driven CRUD
│   ├── analytics/                  ← placeholder
│   ├── audit-logs/                 ← placeholder
│   ├── settings/                   ← placeholder
│   └── support/                    ← placeholder
└── api/
    ├── auth/{login,logout}/        ← session cookie management
    └── uploads/images/             ← multipart proxy → backend /uploads/images
```

Route groups (`(auth)`, `(dashboard)`) are layout-only — they don't affect URLs.
The dashboard layout owns the sidebar, topbar, and overall chrome.

### State conventions

- **List pages** are Server Components. Filters live in URL search params
  (`?search=`, `?role=`, `?offset=`) so they're shareable, restorable, and
  drive the data fetch directly.
- **Mutations** are Server Actions in `lib/<domain>/actions.ts`, called from
  client form components via `useActionState`. After mutating they
  `revalidatePath()` and return form state for inline error rendering.
- **Sliding panels** for create/edit (e.g. user form drawer) are also URL-driven
  — `?panel=new`, `?panel=edit&id=…` — so back/forward works and links are
  shareable.

## Backend integration

| Domain     | Endpoints used                                                    | Frontend touchpoint                          |
| ---------- | ----------------------------------------------------------------- | -------------------------------------------- |
| Auth       | `POST /auth/login`, `GET /auth/me`                                | login form, current-user lookup              |
| Workspaces | `GET/POST/PATCH/DELETE /workspaces`, `GET /workspaces/{id}`       | `/workspaces` + `/workspaces/{new,[id]/edit}` |
| Users      | `GET/POST/PATCH/DELETE /users`, `PATCH /users/{id}/password`      | `/user-access` (table + drawer)              |
| Uploads    | `POST /uploads/images` (multipart)                                | logo uploader on workspace forms             |

The OpenAPI spec is the source of truth — when something feels off, run
`curl http://localhost:8080/swagger/doc.json` and inspect the contract.

### Error envelope

The backend returns `{data,error}` where `error` is `{code, message, details}`.
[`apiFetch`](lib/api/server.ts) throws an `APIRequestError(status, code, message, details)`
on non-2xx or any envelope with an `error` field. Server Actions catch this and
map well-known cases (`409` → field-level error, `403` → friendly message,
fallback → generic banner).

## File-by-file reference

```
app/
  layout.tsx                       Root layout, fonts, body wrapper
  page.tsx                         /  → redirect to /login
  globals.css                      Design tokens (cream/forest-green theme)
  _components/                     Cross-section UI (brand mark, icons)
  (auth)/
    layout.tsx                     Split-screen layout
    login/{page,login-form}.tsx    Login form (calls /api/auth/login)
  (dashboard)/
    layout.tsx                     Sidebar (260px) + topbar shell
    _components/                   Sidebar nav, topbar, form styles, page stub
    workspaces/
      page.tsx                     Server Component: list + stats + pagination
      new/page.tsx                 Create form
      [id]/edit/page.tsx           Edit form + metadata strip + danger zone
      _components/                 Workspace form, logo uploader, delete button
    user-access/
      page.tsx                     Table + filters + URL-driven drawer
      _components/                 Table, row menu (portal), drawer, filters,
                                   form panel, role badge, status toggle
  api/
    auth/{login,logout}/route.ts
    uploads/images/route.ts        Forwards multipart to backend with Bearer

lib/
  api/server.ts                    apiFetch + APIRequestError
  auth/{config,session,types,queries}.ts
  workspaces/{types,queries,actions}.ts
  users/{types,queries,actions}.ts
  uploads/types.ts
```

## Security notes

- JWT lives in an **HttpOnly** cookie — XSS can't lift it.
- The backend URL is read from a **server-only env var** — never bundled
  to the client.
- The superadmin role guard runs in the login route handler. Any user with
  `role !== "superadmin"` gets a `403 forbidden_role` and **no cookie is set**.
- Inactive accounts (`is_active === false`) are blocked on login as well.
- Server Actions read the cookie via `next/headers` and forward it as
  `Authorization`. Client components never see the token.
- Logout is a `POST` to invalidate CSRF surface.

## Conventions when extending

1. **New backend endpoint?** Add types to `lib/<domain>/types.ts`, queries to
   `queries.ts`, mutations to `actions.ts`. Don't call `fetch` directly from a
   page — go through `apiFetch`.
2. **New page?** If it lives behind the sidebar, drop it under
   `app/(dashboard)/<segment>/` and add an entry in
   [`sidebar-nav.tsx`](app/(dashboard)/_components/sidebar-nav.tsx) + the
   `titles` map in [`topbar.tsx`](app/(dashboard)/_components/topbar.tsx).
3. **New filter?** Use URL search params, keep the page a Server Component,
   read params via `await searchParams` (it's a Promise in Next 16).
4. **New form?** Pair a `'use server'` action with `useActionState` on the
   client. Return `{ok, message, fieldErrors, values}` so the form can echo
   back validation state.

## reinit deploy vercel
