# Delta Labs Admin Portal (`deltalabs-admin`)

Secure, responsive administration console for the Delta Labs platform. Built with the Next.js App Router, semantic design tokens, and role-based access control.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`)
- **Styling:** Tailwind CSS v4 + semantic design tokens (`src/app/globals.css`)
- **Data:** TanStack Query v5 + typed `apiClient` (`X-Request-Id`, Bearer JWT)
- **Icons:** lucide-react
- **Testing:** Vitest + React Testing Library + jsdom

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:4001` and talks to the FastAPI backend at
`NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 4001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript) |
| `npm test` | Vitest unit/component tests |

## Structure

```
src/
├── app/                     # App Router entrypoints (/ and /login)
├── components/theme/        # Button, Input, Card, Badge, Typography, Modal
├── lib/                     # apiClient, queryClient, cn, authSession
├── modules/Admin/
│   ├── api/                 # authApi, rbacApi
│   ├── components/          # shell + guards (AuthGuard, SideNav, AdminHeader…)
│   ├── context/             # AuthProvider / useAuth
│   ├── hooks/               # login mutation, click-outside
│   ├── types/               # auth + RBAC types
│   ├── utils/               # permissions, navigation, session storage
│   └── views/               # LoginView, AdminShell, DashboardView…
├── test/                    # Vitest setup
└── middleware.ts            # Edge auth-cookie gate
```

## Authentication & RBAC

- Login: `POST /v1/auth/login` → bearer token + session persisted in
  `localStorage` (`dl.admin.auth.v1`) and a lightweight `dl_admin_session` cookie.
- Session validation: `GET /v1/auth/session`; logout: `POST /v1/auth/logout`.
- Edge middleware redirects unauthenticated traffic to `/login?next=…`.
- `AuthGuard` validates the session client-side; unauthorized API responses clear
  local state.
- Backend role keys map to admin roles: `system_admin → super_admin`,
  `org_owner/org_admin → org_admin`, `school_admin → school_principal`,
  `teacher → moderator`, `finance_admin → auditor`.
- Navigation, header search, and `PermissionGate`/`RoleGate` are permission-aware.

## Status

Phase 1 (foundation) and Phase 2 (authentication + RBAC shell) are complete.
See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the roadmap.
