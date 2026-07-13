# FleetFlow — Phase 4: Software Architecture & Folder Structure

**Document Type:** Architecture Reference
**Stack:** React.js · Tailwind CSS · Node.js · Express.js · PostgreSQL · Prisma ORM · JWT · REST API
**Depends On:** Phase 1 (System Blueprint), Phase 2 (Database Design — 13 tables)
**Scope:** This document defines *how the codebase is organized and why*. It contains no code — only responsibilities, boundaries, and conventions.

---

## 0. Architectural Philosophy

FleetFlow follows a **layered, modular monolith** pattern on the backend and a **feature-colocated, component-driven** pattern on the frontend. Three principles govern every decision below:

1. **Separation of concerns** — each layer has exactly one reason to change. A route file changes only when a URL changes; a service changes only when business logic changes; a repository changes only when the data-access strategy changes.
2. **Dependency direction flows inward** — Controllers depend on Services, Services depend on Repositories, Repositories depend on Prisma. Nothing "below" ever imports something "above" it. This keeps business logic testable without a live database.
3. **Modules mirror the 8 functional pages** — Auth, Dashboard, Vehicle, Driver, Trip, Maintenance, Expense/Fuel, Analytics — so any engineer can find code by thinking about the *feature*, not the *file type*.

---

## 1. Backend Architecture

### 1.1 Full Folder Structure

```
server/
│
├── src/
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── constants.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── vehicle.routes.js
│   │   ├── driver.routes.js
│   │   ├── trip.routes.js
│   │   ├── maintenance.routes.js
│   │   ├── expense.routes.js
│   │   ├── fuelLog.routes.js
│   │   ├── analytics.routes.js
│   │   ├── report.routes.js
│   │   └── notification.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── vehicle.controller.js
│   │   ├── driver.controller.js
│   │   ├── trip.controller.js
│   │   ├── maintenance.controller.js
│   │   ├── expense.controller.js
│   │   ├── fuelLog.controller.js
│   │   ├── analytics.controller.js
│   │   └── report.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── vehicle.service.js
│   │   ├── driver.service.js
│   │   ├── trip.service.js
│   │   ├── maintenance.service.js
│   │   ├── expense.service.js
│   │   ├── fuelLog.service.js
│   │   ├── analytics.service.js
│   │   ├── report.service.js
│   │   └── notification.service.js
│   │
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── vehicle.repository.js
│   │   ├── driver.repository.js
│   │   ├── trip.repository.js
│   │   ├── maintenance.repository.js
│   │   ├── expense.repository.js
│   │   ├── fuelLog.repository.js
│   │   ├── auditLog.repository.js
│   │   └── monthlyReport.repository.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validateRequest.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   ├── rateLimiter.js
│   │   └── notFound.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── vehicle.validator.js
│   │   ├── driver.validator.js
│   │   ├── trip.validator.js
│   │   ├── maintenance.validator.js
│   │   └── expense.validator.js
│   │
│   ├── utils/
│   │   ├── apiResponse.js
│   │   ├── apiError.js
│   │   ├── asyncHandler.js
│   │   ├── tokenUtils.js
│   │   ├── hashUtils.js
│   │   ├── pagination.js
│   │   ├── costCalculator.js
│   │   └── logger.js
│   │
│   ├── jobs/
│   │   ├── licenseExpiryCheck.job.js
│   │   └── monthlyReportGenerator.job.js
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │
│   ├── app.js
│   └── server.js
│
├── logs/
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
└── package.json
```

### 1.2 Layer-by-Layer Responsibility

**`config/`**
Owns every value that changes between environments (dev, staging, production) — database URL, JWT secret, CORS allow-list, port, token expiry windows. Nothing outside this folder reads `process.env` directly. This means switching environments never requires touching business code, and secrets stay auditable in one place.

**`routes/`**
Pure URL-to-controller mapping, grouped by resource (mirroring the REST endpoints already planned in the SRS: `/api/vehicles`, `/api/trips`, etc.). A route file should never contain logic — only HTTP verbs, paths, middleware chains, and a controller reference. This makes the entire API surface readable in seconds by scanning `routes/index.js`.

**`controllers/`**
Translate HTTP into application calls. A controller extracts `req.body`/`req.params`/`req.user`, calls exactly one service method, and shapes the HTTP response (status code + payload via `apiResponse.js`). Controllers contain **no business rules** — no capacity checks, no license validation, no status transitions. If a rule like "cargo weight ≤ vehicle capacity" lived here, it would be untestable without spinning up Express.

**`services/`**
The business-logic core, and the layer that encodes every rule from the SRS's Business Rules section (license expiry, capacity validation, vehicle "In Shop" locking, trip lifecycle transitions, ROI/fuel-efficiency formulas). Services orchestrate one or more repositories, enforce invariants, and throw domain-specific errors (`ApiError`) when a rule is violated. Services know nothing about Express — they could be called from a CLI script or a queue worker with zero changes.

**`repositories/`**
The only layer permitted to call Prisma. Each repository exposes intention-revealing methods (`findAvailableVehicles()`, `markInMaintenance(vehicleId)`) rather than leaking raw Prisma queries into services. This isolation is what makes it possible to swap Prisma for another ORM later, or to mock data access entirely in unit tests, without touching a single business rule.

**`middleware/`**
Cross-cutting concerns that wrap the request/response cycle: `authenticate.js` verifies the JWT and attaches `req.user`; `authorize.js` enforces the RBAC permission matrix from Phase 1 (Manager/Dispatcher/Safety Officer/Financial Analyst); `validateRequest.js` runs validator schemas before a controller ever executes; `errorHandler.js` is the single place that turns thrown errors into consistent JSON error responses; `requestLogger.js` and `rateLimiter.js` handle observability and abuse protection.

**`validators/`**
Schema-based input validation (structure, types, required fields) — distinct from business validation in services. A validator rejects a trip request with a negative cargo weight; a service rejects a trip request where cargo weight exceeds *that specific vehicle's* capacity. Keeping these separate means malformed input is rejected before it ever reaches business logic.

**`utils/`**
Stateless, dependency-free helper functions reused across layers: standardized success/error response envelopes, async error wrapping (so controllers don't need repetitive try/catch), token signing/verification, password hashing, pagination helpers, and the cost/ROI calculators defined in the SRS (`Total Operational Cost = Fuel + Maintenance`, `ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost`).

**`jobs/`**
Scheduled/background tasks that don't belong to a single HTTP request — license expiry sweeps that flag drivers before they're assigned to a trip, and monthly report pre-aggregation that populates the denormalized `MonthlyReport` table from Phase 2.

**`prisma/`**
The schema, migration history, and seed data — the single source of truth for the 13-table database design from Phase 2.

**Error Handling** — centralized through `ApiError` (a typed error class carrying an HTTP status + message) thrown anywhere in services or middleware, caught exactly once by `errorHandler.js`. This guarantees every error response — validation failure, business rule violation, unhandled exception — has the same JSON shape, which the frontend can rely on without per-endpoint parsing.

**Logging** — `utils/logger.js` provides a structured logger (info/warn/error levels) used by `requestLogger.js` for access logs and by services for business-event logs (e.g., "vehicle moved to In Shop status"). Logs are written to `logs/` in development and intended to stream to a log aggregator in production, satisfying the SRS's reliability requirement for error logging.

---

## 2. Frontend Architecture

### 2.1 Full Folder Structure

```
client/
│
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── vehicles/
│   │   │   ├── VehicleRegistryPage.jsx
│   │   │   └── VehicleDetailPage.jsx
│   │   ├── drivers/
│   │   │   ├── DriverListPage.jsx
│   │   │   └── DriverProfilePage.jsx
│   │   ├── trips/
│   │   │   └── TripDispatcherPage.jsx
│   │   ├── maintenance/
│   │   │   └── MaintenancePage.jsx
│   │   ├── expenses/
│   │   │   └── ExpenseFuelPage.jsx
│   │   └── analytics/
│   │       └── AnalyticsReportsPage.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── StatusPill.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Drawer.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── vehicles/
│   │   │   ├── VehicleCard.jsx
│   │   │   └── VehicleForm.jsx
│   │   ├── drivers/
│   │   │   ├── DriverRow.jsx
│   │   │   └── LicenseBadge.jsx
│   │   ├── trips/
│   │   │   ├── TripForm.jsx
│   │   │   └── CapacityValidator.jsx
│   │   └── charts/
│   │       ├── UtilizationChart.jsx
│   │       └── ROIChart.jsx
│   │
│   ├── layouts/
│   │   ├── AppLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── SideNav.jsx
│   │   └── TopNav.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useVehicles.js
│   │   ├── useDrivers.js
│   │   ├── useTrips.js
│   │   ├── usePagination.js
│   │   └── useDebounce.js
│   │
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── auth.service.js
│   │   ├── vehicle.service.js
│   │   ├── driver.service.js
│   │   ├── trip.service.js
│   │   ├── maintenance.service.js
│   │   ├── expense.service.js
│   │   └── analytics.service.js
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleGate.jsx
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── roleMatrix.js
│   │
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env
└── package.json
```

### 2.2 Layer-by-Layer Responsibility

**`pages/`**
One folder per functional module from the SRS (Auth, Dashboard, Vehicles, Drivers, Trips, Maintenance, Expenses, Analytics), matching the 8 pages already designed in the UI export. A page composes layouts, components, and hooks — it should hold minimal logic of its own, acting as an assembly point rather than a place where business rules live.

**`components/`**
Split into `common/` (design-system primitives used everywhere — buttons, status pills, tables, drawers, modals — matching the DESIGN.md component spec) and feature folders (`vehicles/`, `drivers/`, `trips/`, `charts/`) for components tied to one domain. This split prevents a generic `Button` from ever depending on trip-specific logic, and lets feature components be deleted cleanly if a feature is removed.

**`layouts/`**
Structural shells — the persistent side navigation, top bar, and page chrome seen across every screen in the UI export. `AppLayout` wraps authenticated pages; `AuthLayout` wraps the login/registration split-screen. Layouts own positioning and navigation state, never business data.

**`context/`**
Global state that many unrelated components need: `AuthContext` (current user, role, token), `ThemeContext` (light/dark, matching the DESIGN.md tokens), `NotificationContext` (toast/alert queue). Context is intentionally used sparingly — only for state that is genuinely cross-cutting, not as a substitute for component props or local state.

**`hooks/`**
Encapsulate data-fetching and reusable stateful logic per domain (`useVehicles`, `useTrips`), plus generic utility hooks (`usePagination`, `useDebounce` for the search bars seen throughout the UI). Hooks are the bridge between `services/` (raw API calls) and components (rendering) — a component should rarely call a service directly.

**`services/` (frontend)**
Thin wrappers around HTTP calls to the backend REST API, one file per resource, all routed through a shared `apiClient.js` (Axios/fetch instance with base URL, JWT header injection, and centralized error interception). This mirrors the backend's `services/` naming intentionally — both layers are the "boundary" of their respective sides.

**`routes/`**
`AppRoutes.jsx` declares the route table; `ProtectedRoute.jsx` redirects unauthenticated users to Login; `RoleGate.jsx` enforces the RBAC matrix on the client (e.g., hiding "Full" Vehicle actions from a Dispatcher who only has "View" per the Phase 1 permission matrix). Client-side role gating is a UX convenience only — the backend `authorize.js` middleware remains the actual security boundary.

**`utils/`**
Pure functions with no React dependency: currency/date formatters (matching the ₹ and date formats seen in the UI export), client-side input validators, shared constants (status enums, roles), and a copy of the role-permission matrix for `RoleGate` to consult.

**`assets/`**
Icons, images, and global style tokens — the DESIGN.md color/typography/spacing system lives here as the Tailwind config source, not duplicated per component.

---

## 3. End-to-End Architecture Flow

```
                        ┌────────────────────────┐
                        │   React + Tailwind      │
                        │   (client/)             │
                        │  pages → components     │
                        │  hooks → services/*.js  │
                        └───────────┬─────────────┘
                                    │ HTTPS (fetch/axios)
                                    │ Authorization: Bearer <JWT>
                                    ▼
                        ┌────────────────────────┐
                        │   Express.js            │
                        │   (server/)             │
                        │  routes → middleware    │
                        │  → controllers          │
                        └───────────┬─────────────┘
                                    │ calls
                                    ▼
                        ┌────────────────────────┐
                        │   Services              │
                        │  business rules, RBAC,  │
                        │  cost/ROI calculators    │
                        └───────────┬─────────────┘
                                    │ calls
                                    ▼
                        ┌────────────────────────┐
                        │   Repositories          │
                        │  data-access contracts  │
                        └───────────┬─────────────┘
                                    │ Prisma Client calls
                                    ▼
                        ┌────────────────────────┐
                        │   Prisma ORM            │
                        │  schema.prisma,         │
                        │  migrations, typed      │
                        │  query builder          │
                        └───────────┬─────────────┘
                                    │ SQL over connection pool
                                    ▼
                        ┌────────────────────────┐
                        │   PostgreSQL            │
                        │  13 tables (Phase 2):   │
                        │  Role, User, Vehicle,   │
                        │  Driver, Trip, ...      │
                        └────────────────────────┘
```

**How a single request actually moves through this stack** — using "Dispatcher creates a trip" as the example:

1. **React** — `TripForm.jsx` collects vehicle, driver, and cargo weight; `useTrips.js` calls `trip.service.js` (frontend).
2. **Frontend service → Express** — `apiClient.js` sends `POST /api/trips` with the JWT in the header.
3. **Middleware** — `authenticate.js` verifies the token; `authorize.js` confirms the Dispatcher role has "Full" access to Trips per the RBAC matrix; `validateRequest.js` checks the payload shape against `trip.validator.js`.
4. **Controller** — `trip.controller.js` extracts the validated body and calls `trip.service.js` (backend).
5. **Service** — `trip.service.js` enforces the business rules: vehicle must be `Available`, driver's license must not be expired, cargo weight must not exceed the vehicle's max capacity. If any rule fails, it throws an `ApiError`, caught by `errorHandler.js` and returned as a structured 4xx response.
6. **Repository** — on success, `trip.repository.js` and `vehicle.repository.js` are called to create the `Trip` row and flip the `Vehicle`/`Driver` status to `On Trip`, inside a single Prisma transaction to guarantee consistency.
7. **Prisma → PostgreSQL** — Prisma generates the parameterized SQL, executes it against the `trip`, `vehicle`, and `driver` tables, and returns typed results.
8. **Response flows back up** — repository → service → controller → `apiResponse.js` envelope → React, where `useTrips.js` updates local state and the UI re-renders the trip in `Dispatched` status.

This same pattern — Controller → Service → Repository → Prisma → PostgreSQL — repeats identically for every module (Vehicle, Driver, Maintenance, Expense, Analytics), which is what keeps the codebase predictable as it grows to 8 modules and 13 tables.

---

## 4. Naming Conventions

### 4.1 Folder Naming

| Convention | Example | Rationale |
|---|---|---|
| `camelCase` for files, `lowercase` for folders | `services/`, `vehicle.service.js` | Matches Node.js/npm ecosystem norms; avoids cross-platform case-sensitivity bugs (macOS/Windows are case-insensitive, Linux CI servers are not — a mismatch here causes builds that pass locally and fail in production). |
| Domain-first grouping over type-first | `pages/vehicles/`, `components/vehicles/` | Once the app has 8+ modules, grouping by *feature* lets an engineer delete or hand off an entire module by deleting one folder, versus type-first grouping where a single feature's files are scattered across `pages/`, `components/`, `hooks/`. |
| Singular for architectural layers, no abbreviation | `controllers/`, `repositories/`, not `ctrl/`, `repos/` | Full words are self-documenting to new engineers and are what Express/Node style guides (Airbnb, Google) converge on; abbreviations save keystrokes but cost onboarding time. |

### 4.2 File Naming

| Convention | Example | Rationale |
|---|---|---|
| `<domain>.<layer>.js` for backend | `vehicle.controller.js`, `vehicle.service.js`, `vehicle.repository.js` | Immediately answers "what does this file do, to what data" without opening it; enables instant fuzzy-search (`vehicle.*`) across all layers for a given domain during debugging. |
| `PascalCase.jsx` for React components | `VehicleForm.jsx`, `StatusPill.jsx` | Matches the React community standard (and JSX itself — a lowercase tag name is treated as an HTML element, not a component, so PascalCase is functionally required, not just stylistic). |
| `camelCase` for hooks, prefixed `use` | `useVehicles.js`, `useDebounce.js` | The `use` prefix is a hard requirement for React's Rules of Hooks linting to correctly detect hook-specific behavior (conditional-call warnings, dependency-array checks). |
| `<domain>.validator.js` / `.middleware` suffix | `vehicle.validator.js`, `authenticate.js` (implied middleware) | Keeps validation logic discoverable next to its matching controller/service without name collisions. |

### 4.3 API (REST Endpoint) Naming

| Convention | Example | Rationale |
|---|---|---|
| Plural nouns for resource collections | `/api/vehicles`, `/api/drivers`, `/api/trips` | REST convention (Roy Fielding's original dissertation and virtually every public API since) — a collection endpoint should read as "the set of all X," which plural nouns express unambiguously; singular/plural mixing is the single most common inconsistency in poorly designed APIs. |
| HTTP verbs carry the action, not the URL | `POST /api/trips` (not `/api/trips/create`) | Keeps the URL a pure resource identifier; the verb (GET/POST/PUT/PATCH/DELETE) is what changes behavior, matching HTTP semantics that browsers, caches, and API gateways already understand. |
| Nested resources for ownership | `/api/vehicles/:id/maintenance` | Expresses the one-to-many relationship (one Vehicle → many Maintenance records) directly in the URL structure, matching the ER relationships defined in Phase 2. |
| `PATCH` for partial state transitions | `PATCH /api/trips/:id/status` (per SRS Section 11) | Distinguishes a full resource replacement (`PUT`) from a targeted lifecycle transition (Draft → Dispatched → Completed), which is exactly the kind of change the Trip lifecycle rule requires — using `PUT` here would incorrectly imply the whole trip record is being replaced. |

### 4.4 Database Naming (Prisma / PostgreSQL)

| Convention | Example | Rationale |
|---|---|---|
| `PascalCase` singular for Prisma models | `Vehicle`, `Driver`, `MonthlyReport` | Prisma's own style guide and generated TypeScript types read naturally in singular PascalCase (`Vehicle`, not `Vehicles` or `vehicle`), and this is what Phase 2's 13-table design already follows. |
| `snake_case` for actual PostgreSQL columns via `@map` | `license_expiry_date` mapped from `licenseExpiryDate` | SQL tooling, `psql`, and most database-admin conventions are case-insensitive-by-default and traditionally snake_case; mapping lets the Prisma/JS side stay idiomatic camelCase while the SQL side stays idiomatic snake_case, avoiding the need for constant quoting of mixed-case identifiers in raw SQL or admin tools. |
| Foreign keys named `<relatedModel>Id` | `vehicleId`, `driverId` on `Trip` | Immediately signals a relationship without needing to check the schema, and matches Prisma's auto-generated relation field conventions. |
| Enum values in `SCREAMING_SNAKE_CASE` or fixed string sets | `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED` | Distinguishes fixed-vocabulary status values from free-text data at a glance in queries and logs, and matches Prisma's enum-generation convention. |

---

## 5. Why This Architecture Scales With the Project

- **Adding a 9th module** (e.g., the SRS's "Future Enhancements" like GPS Tracking) means adding one route file, one controller, one service, one repository, and one page folder — never modifying existing ones.
- **RBAC changes** (a new role, or a permission change in the Phase 1 matrix) touch exactly two files: `middleware/authorize.js` on the backend and `utils/roleMatrix.js` on the frontend.
- **Database changes** flow in one direction: Phase 2 schema → `prisma/schema.prisma` → migration → repositories updated → services updated. Controllers and the frontend are insulated from schema changes as long as the service-layer contract (function signatures) stays stable.
- **Testing** is layer-appropriate: repositories are integration-tested against a real (test) database; services are unit-tested with mocked repositories to verify business rules like capacity checks and license validation in isolation; controllers are tested via HTTP integration tests.

This architecture is ready to move into Phase 5 (implementation sequencing) without further structural decisions required.
