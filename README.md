# Personal Finance DSS — Frontend

## Name and Introduction

Personal Finance is a personal finance management system. The frontend provides a web interface for users to sign in, manage accounts, transactions, budgets, goals, debts, income, and monthly budget allocation.

## Tech Stack

- **Runtime:** Node.js 18+ (recommended 20+)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Language:** TypeScript 5
- **State:** Redux Toolkit (auth, accounts, categories, budgets, goals, debts, transactions, income, dashboard, analytics, month, etc.)
- **Styling:** Tailwind CSS, tailwindcss-animate
- **Components:** Radix UI, shadcn-style (components.json), Lucide React
- **Forms:** React Hook Form, Zod (validation)
- **HTTP client:** Axios (API client with interceptors, refresh token, response unwrapping)
- **Charts:** Recharts
- **i18n:** Multi-language support (e.g. vi/en) via context and translation files
- **PDF:** @react-pdf/renderer (reports, export)
- **Build / package:** pnpm or npm, ESLint, swagger-typescript-api (generate types from backend Swagger)

Details are in `package.json`.

## System Architecture

The frontend is organized in a feature-based structure: split by feature (auth, accounts, transactions, budgets, etc.), each with a Redux slice, components, routes, and (where applicable) API services.

### Main Directory Structure

- **`src/app/`**  
  Next.js App Router: layout, pages (login, register, dashboard, accounts, transactions, budgets, goals, debts, income, calendar, month, budget-allocation, dss-demo, analytics, categories, settings, investments, brokers), globals.css. Each route maps to one or more business pages.

- **`src/features/`**  
  Feature modules. Each typically has: Redux slice (state, async thunks), components (UI, modals, forms), routes (page components used in the app), and optionally services for API calls. Examples: auth, accounts, transactions, budgets, budget-constraints, goals, debts, income, categories, dashboard, analytics, month-dss, calendar, investments, brokers, profile, settings, shell (layout, nav, sidebar), errors.

- **`src/components/`**  
  Shared components: UI primitives (button, card, input, select, table, dialog, etc.), layout, form controls, category picker, transaction link selector. Usually built with Radix UI and Tailwind.

- **`src/contexts/`**  
  React contexts: auth (user, login, register, logout), i18n (locale, t), settings (theme, preferences).

- **`src/services/api/`**  
  API client and backend services: base client (Axios, baseURL from `NEXT_PUBLIC_API_URL`, interceptors, refresh token, buildQueryString), per-domain services (auth, users, profile, accounts, transactions, budgets, goals, debts, categories, income-profiles, calendar, month, notifications, investments, brokers, budget-allocation, goal-prioritization, etc.), and types (TypeScript interfaces/DTOs).

- **`src/hooks/`**  
  Custom hooks: use-accounts, use-budgets, use-transactions, use-auth-redux, use-month-analytics-data, use-constraint-charts-data, use-budget-charts-data, use-toast, use-mobile, etc.

- **`src/lib/`**  
  Shared utilities and config: Redux store, hooks (useAppDispatch, useAppSelector), i18n translations, legacy API client if present.

- **`src/types/`**  
  App-wide TypeScript definitions (api.ts, chat.ts): enums, entity types, query params, response types.

- **`src/styles/`**  
  Global CSS (globals.css), scrollbar-hide.

- **`public/`**  
  Static assets (logo, placeholder images).

## Key Features

- **Authentication:** Login (email/password), register, Google OAuth (if enabled on backend), logout; access token in state/cookie, refresh token via cookie; AuthContext and Redux auth slice.
- **User and profile:** View and update profile, onboarding.
- **Accounts:** List and detail views, create/edit/delete accounts, send/receive money, top-up; broker connections (e.g. SePay, OKX).
- **Transactions:** List with filters, search, pagination; create/edit/delete; import JSON/CSV; link to budget/goal/debt; assign category.
- **Budgets and budget constraints:** Budget list and detail, spending constraints, budget charts.
- **Goals and debts:** Financial goals, debt payoff, contributions from accounts, progress charts.
- **Income:** Income sources, income stats and charts.
- **Categories:** Income/expense category tree, CRUD.
- **Dashboard:** Balance overview, income/expense, upcoming events, quick actions.
- **Calendar and month:** Event calendar, month page and DSS workflow (month input, analytics, goal prioritization, debt strategy, budget allocation, month closing).
- **Analytics:** Budget allocation (goal programming), goal prioritization (AHP), debt strategy, debt tradeoff, charts and reports.
- **Investments and brokers:** Investment assets, investment transactions, broker connections.
- **Notifications and settings:** Notifications, user settings, language, UI preferences.

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm, yarn, or pnpm
- Personal Finance DSS backend running with a known API URL (e.g. `http://localhost:8080/api/v1`)

### Installing Dependencies

```bash
npm install
```

or:

```bash
pnpm install
```

### Environment Variables

1. Create `.env.local` in the `client` directory (or provide env vars at run/build time).
2. Minimum configuration:
   - **`NEXT_PUBLIC_API_URL`** — Backend API base URL (e.g. `http://localhost:8080/api/v1`). The frontend uses this for the Axios baseURL (see `src/services/api/client.ts`). If the backend runs on the default host/port, this can be omitted (code falls back to `http://localhost:8080/api/v1`).

### Development

```bash
npm run dev
```

The app is available at `http://localhost:3000`. Ensure the backend is running and `NEXT_PUBLIC_API_URL` points to it so login and data loading work.

### Build and Production

```bash
npm run build
npm start
```

### Other Scripts

- **`npm run lint`** — Run ESLint.
- **`npm run generate:types`** — Generate TypeScript types from the backend Swagger spec (script in `scripts/generate-types.js`; backend spec required).

## API Documentation (Backend Integration)

The frontend does not publish its own API docs; all HTTP calls target the Personal Finance DSS backend.

- **Base URL:** From `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api/v1`).
- **Backend docs:** Swagger UI at `http://localhost:8080/swagger/index.html` when the backend is running; spec at `/openapi/swagger.yaml` and `/openapi/swagger.json`.
- **How the frontend calls the API:** Services under `src/services/api/services/` (auth, users, profile, accounts, transactions, budgets, goals, debts, categories, income-profiles, calendar, month, notifications, investments, brokers, budget-allocation, goal-prioritization, etc.) use the client in `src/services/api/client.ts` (Axios, interceptors, refresh token, unwrap `data`). Endpoints and query params follow the backend; parameter name mapping (e.g. `start_date` to `startBookingDate`) is applied in individual services where needed.
- **Types:** `src/services/api/types/` and `src/types/api.ts` describe request/response shapes; they can be kept in sync with Swagger via `npm run generate:types` when the backend exposes a spec.
