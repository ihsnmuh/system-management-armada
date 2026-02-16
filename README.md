# System Management Armada

A real-time fleet management dashboard built with Next.js 16 and the MBTA (Massachusetts Bay Transportation Authority) API. Displays live vehicle positions, routes, trips, and schedules with auto-refreshing data and interactive map views.

## Features

- **Live Vehicle Tracking** — Vehicle list with 30-second auto-refresh and real-time status indicators (In Transit, Stopped, Incoming)
- **Cascading Filters** — Filter vehicles by route and trip using infinite-scroll dropdown selectors
- **Vehicle Detail Dialog** — View detailed vehicle information including route shape on an interactive Leaflet map, current stop, trip, and schedule data
- **Pagination** — Offset-based pagination with configurable page size
- **API Proxy** — Server-side catch-all route that proxies MBTA API requests, keeping the API key hidden from the client
- **Toast Notifications** — Background refetch status feedback via Sonner toasts

## Tech Stack

| Category      | Technology                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router)                              |
| Language      | TypeScript 5 (strict mode)                                                 |
| UI            | React 19, [shadcn/ui](https://ui.shadcn.com) (new-york), Radix UI, Base UI |
| Styling       | Tailwind CSS v4, CVA                                                       |
| Server State  | TanStack React Query v5                                                    |
| Maps          | Leaflet + React Leaflet                                                    |
| Icons         | Lucide React                                                               |
| Notifications | Sonner                                                                     |

## Prerequisites

- **Node.js** >= 18
- **npm** (ships with Node.js)
- **MBTA API Key** — Get one at [api-v3.mbta.com](https://api-v3.mbta.com)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd system-management-armada
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:

   ```env
   MBTA_API_URL=https://api-v3.mbta.com
   MBTA_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command                  | Description                               |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | Start development server with hot reload  |
| `npm run build`          | Production build (includes type checking) |
| `npm run start`          | Start production server                   |
| `npm run lint`           | Run ESLint                                |
| `npx prettier --check .` | Check code formatting                     |
| `npx prettier --write .` | Fix code formatting                       |

## Project Structure

```
app/
  api/mbta/[...path]/       # Catch-all API proxy to MBTA
  containers/               # Smart components with data-fetching logic
    TopContainer/            # Dashboard header with live clock
    VehicleList/             # Main vehicle list, filters, pagination, detail dialog
  providers/                # React Query client provider
components/
  ui/                       # shadcn/ui primitives (do not edit manually)
  cards/                    # Domain-specific card components
hooks/queries/              # TanStack React Query hooks (use-*.ts)
lib/
  api/
    client.ts               # Generic typed fetch wrapper
    endpoints/              # Domain API functions + query key factories
  utils.ts                  # Utilities (cn, pagination helpers, etc.)
types/api/                  # TypeScript types, interfaces, and enums
```

## Architecture

Data flows through a 4-tier architecture:

```
React Query Hook (hooks/queries/)
  → API Endpoint Function (lib/api/endpoints/)
    → Fetch Client (lib/api/client.ts)
      → Next.js API Proxy (app/api/mbta/[...path]/)
        → MBTA v3 API
```

- **Hooks** configure caching, polling intervals, and query keys
- **Endpoints** build MBTA JSON:API query parameters and define key factories
- **Client** is a generic typed fetch wrapper targeting the internal proxy
- **Proxy** appends the API key server-side and forwards requests to MBTA
