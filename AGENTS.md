# AGENTS.md — system-management-armada

## Project Overview

Next.js 16 (App Router) fleet management dashboard using React 19, TypeScript (strict),
TanStack React Query v5, Tailwind CSS v4, and shadcn/ui (new-york style). Proxies the
MBTA API through a catch-all Next.js API route to hide the API key server-side.

## Build / Lint / Test Commands

```bash
npm run dev          # Start dev server (next dev)
npm run build        # Production build (next build) — includes type checking
npm run start        # Start production server (next start)
npm run lint         # ESLint (v9 flat config: core-web-vitals + typescript + prettier)
npx prettier --check .   # Check formatting
npx prettier --write .   # Fix formatting
```

**No testing framework is configured.** If you add one, prefer Vitest + React Testing
Library. There are no test files or cursor/copilot rule files in the project.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, React 19.2)
- **Language:** TypeScript 5 (`strict: true`, `@/*` path alias → project root)
- **Styling:** Tailwind CSS v4 (no `tailwind.config` — configured via CSS) + shadcn/ui + CVA
- **Server State:** TanStack React Query v5 (30s polling, 60s stale time)
- **UI Primitives:** `radix-ui` (Dialog, Select, etc.), `@base-ui/react` (Combobox)
- **Maps:** leaflet + react-leaflet (dynamically imported — no SSR)
- **Icons:** lucide-react

## Project Structure

```
app/
  api/mbta/[...path]/       # Catch-all API proxy route (GET only)
  containers/               # Smart components with data-fetching (PascalCase dir/index.tsx)
  providers/                # QueryProvider (React Query client)
components/
  ui/                       # shadcn/ui primitives — do NOT edit manually
  cards/                    # Domain-specific card components
hooks/queries/              # TanStack Query hooks (use-*.ts)
lib/api/
  client.ts                 # Generic typed fetch wrapper (apiClient<T>)
  endpoints/                # Domain API functions + query key factories
lib/utils.ts                # cn(), parseOffsetFromUrl(), generatePageNumbers()
types/api/                  # TypeScript types/interfaces/enums (barrel via index.ts)
```

## Code Style

### Formatting (Prettier — `.prettierrc`)

Single quotes, semicolons, trailing commas (all), 80 char width, 2-space indent, LF endings.
VS Code is configured for format-on-save + ESLint auto-fix (`.vscode/settings.json`).

### Imports

1. External packages first (`react`, `next`, `@tanstack`, `lucide-react`)
2. Aliased imports (`@/...`) second
3. Relative imports (`./`, `../`) last
4. Use `import type` for type-only imports

```typescript
import { useQuery } from '@tanstack/react-query';
import type { Vehicle } from '@/types/api';
import { apiClient } from '../client';
```

### Naming Conventions

| Item                   | Convention               | Example                               |
| ---------------------- | ------------------------ | ------------------------------------- |
| Custom components      | PascalCase file          | `Navbar.tsx`, `Typography.tsx`        |
| Domain components      | kebab-case in subdir     | `cards/vehicle.tsx`                   |
| Containers             | PascalCase dir/index.tsx | `VehicleList/index.tsx`               |
| UI primitives (shadcn) | kebab-case               | `ui/button.tsx`, `ui/card.tsx`        |
| Hooks                  | `use-` prefix kebab-case | `use-vehicles.ts`                     |
| API endpoints          | kebab-case               | `endpoints/vehicles.ts`               |
| Type files             | kebab-case               | `types/api/vehicles.ts`               |
| Functions              | camelCase                | `buildQuery`, `apiClient`             |
| Component functions    | PascalCase               | `VehicleCard`, `ContainerVehicleList` |
| Constants              | UPPER_SNAKE_CASE         | `STATUS_CONFIG`, `ENDPOINTS`          |
| Booleans               | `is` prefix              | `isLoading`, `isRefetching`           |
| Enums                  | PascalCase + UPPER_SNAKE | `VehicleCurrentStatus.IN_TRANSIT_TO`  |

### Types and Interfaces

- Prefer `interface` for object shapes; `type` only for unions/intersections
- Organize in `types/api/` with barrel re-exports via `index.ts`
- Use `enum` for finite string sets (not string unions)
- Use `as const` for constant objects and query key tuples
- Inline simple props: `{ vehicle }: { vehicle: VehicleWithRoute }`
- Extend HTML props via `React.ComponentProps<"div">` (shadcn pattern)

### Components

- **Functional components only** — no class components
- Custom components: arrow function + `export default` at bottom
- Next.js pages/layouts: `export default function Name()`
- shadcn/ui: `function Name()` + named export group at bottom
- `'use client'` only when the component needs client-side interactivity
- Server components are the default
- Leaflet/map components must use `next/dynamic` with `ssr: false`

### Error Handling

- API proxy: try/catch → `NextResponse.json()` with status forwarding
- API client (`lib/api/client.ts`): `throw new Error(res.statusText)` on non-ok
- UI layer: delegate to TanStack Query (`isError`, skeletons while loading)
- Server-side: `console.error` for logging — no custom error classes

### Data Fetching (4-tier architecture)

```
useVehicles(params)                         # Hook (hooks/queries/)
  → useQuery({ queryKey, queryFn })         # TanStack Query
    → vehicleApi.getAll(params)             # Endpoint (lib/api/endpoints/)
      → apiClient<T>('/vehicles?...')       # Client (lib/api/client.ts)
        → fetch('/api/mbta/vehicles')       # Proxy (app/api/mbta/)
```

- Query key factories: `vehicleKeys.list(params)` using `as const` tuples
- Polling: `refetchInterval` (30s for lists, 6s for detail views)
- Use `include` param for JSON:API relationship sideloading
- Infinite queries: `useInfiniteQuery` with offset-based pagination for dropdowns
- Conditional queries: `enabled: !!id` for detail views

### State Management

- **Server state:** TanStack React Query only — no Redux/Zustand
- **Client state:** `useState` for local UI state only (pagination, filters, dialogs)

### Styling

- `cn()` from `@/lib/utils` for conditional Tailwind class merging
- shadcn/ui compound components (`Card`, `CardHeader`, `CardContent`, etc.)
- CVA (`class-variance-authority`) for variant-based component styling
- Theme via CSS variables in `app/globals.css` (light/dark with `oklch()` colors)
- Do not manually edit `components/ui/` — use `npx shadcn add <component>`

### Comments

- Add comments only for function/component documentation — avoid noise
- Both Indonesian and English comments are used in the codebase

### Environment Variables

Server-side only (`.env`, gitignored). Required variables:

- `MBTA_API_URL` — MBTA v3 API base URL (e.g., `https://api-v3.mbta.com`)
- `MBTA_API_KEY` — API key sent as `x-api-key` header

Access via `process.env.*` in API routes only. The proxy pattern keeps keys off the client.

### Git Conventions

- Default branch: `master`
- Branch naming: `feature/`, `chore/`, `refactor/`, `fix/` prefixes
- Commit messages: conventional style — `feat:`, `chore:`, `refactor:`, `fix:`
