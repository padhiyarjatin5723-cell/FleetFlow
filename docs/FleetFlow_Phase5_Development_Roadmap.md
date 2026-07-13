# FleetFlow — Phase 5: Development Roadmap & Engineering Best Practices

**Document Type:** Implementation Roadmap (No Code)
**Prepared As:** Senior Software Architect / Technical Lead
**Stack:** React.js + Tailwind CSS | Node.js + Express.js | PostgreSQL + Prisma ORM | JWT (refresh rotation) | REST
**Inputs Referenced:** Phase 1 Architecture Blueprint, Phase 2 Database Design (13 tables), SRS v1.0, Project PDF, DESIGN.md, Stitch UI exports

---

## 0. How This Roadmap Is Organized

This document sequences the build so that **no module is started before the data and services it depends on exist**. It follows the dependency-driven sequencing principle established in Phase 1/2: a module is buildable only once every table, foreign key, and upstream status transition it reads or writes already exists. Modules that aggregate data (Dashboard, Analytics) are deliberately built last, even though Dashboard is the first screen a user sees after login.

---

## 1. Module Development Order

**Build Sequence:**

1. Authentication & RBAC Foundation
2. Vehicle Registry
3. Driver Profiles & Safety
4. Maintenance & Service Logs
5. Trip Dispatcher & Management
6. Fuel & Expense Logging
7. Command Center (Main Dashboard)
8. Operational Analytics & Financial Reports

### Why This Order

- **Auth is always first.** Every table below has `createdBy`/`updatedBy` references and every endpoint is gated by RBAC middleware. Nothing else can be meaningfully tested without a logged-in, role-bearing user.
- **Vehicle Registry and Driver Profiles come next, in parallel priority.** They are the two "master data" entities that every downstream workflow (Maintenance, Trip Dispatcher) references via foreign key. Neither depends on the other, so they can be developed concurrently by two engineers.
- **Maintenance precedes Trip Dispatcher.** The dispatcher's vehicle-availability query must already respect the "In Shop" status transition that Maintenance owns. Building Trip Dispatcher first would mean re-touching its availability logic later — a wasted cycle.
- **Trip Dispatcher precedes Fuel & Expense Logging.** Expense/fuel records are logged *against a completed trip and vehicle*, so trips must exist before there is anything to log costs against.
- **Dashboard is 7th, not 2nd**, despite being the first page a logged-in user lands on. It is a pure aggregation surface with zero tables of its own — it reads from Vehicle, Trip, Maintenance, Driver, and Notification. Building it earlier would mean wiring it against fake/incomplete data and rebuilding its queries repeatedly as each source module lands.
- **Analytics & Financial Reports is last.** It is the most data-hungry module in the system: fuel efficiency, ROI, and cost-per-km all require complete historical Trip, FuelLog, Expense, and Maintenance data, plus the denormalized `MonthlyReport` rollups. It cannot be meaningfully validated until every upstream module is producing real data.

---

## 2. Per-Module Breakdown

### Module 1 — Authentication & RBAC Foundation

- **Goal:** Establish secure login, session/refresh-token lifecycle, and the role-based permission matrix that every other module's API layer enforces.
- **Dependencies:** None (foundation module).
- **Database Tables Required:** `Role`, `User`, `RefreshToken`.
- **APIs Required:** `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `POST /api/auth/forgot-password`, `POST /api/auth/change-password`, `GET /api/auth/me`.
- **Frontend Pages Required:** Login (role selector + email/password), Forgot Password flow, Enterprise Registration (from design export).
- **Estimated Complexity:** Medium (the RBAC middleware and refresh-rotation logic are the hard parts, not the UI).
- **Common Mistakes:**
  - Storing raw refresh tokens instead of hashed values.
  - Enforcing RBAC only in the frontend (hiding buttons) without a matching server-side guard — the #1 real-world vulnerability in RBAC systems.
  - Not rotating refresh tokens on use, allowing stolen-token replay.
  - Forgetting to invalidate all refresh tokens on password change.
- **Testing Strategy:** Unit tests for password hashing and token generation; integration tests hitting `/login` → `/refresh` → `/logout` full lifecycle; negative tests for expired/revoked tokens; RBAC matrix tests (each of the 4 roles against each protected route, asserting 200 vs 403).

---

### Module 2 — Vehicle Registry (Asset Management)

- **Goal:** CRUD for physical fleet assets and the authoritative source of vehicle `status` (Available / On Trip / In Shop / Out of Service) that Trip Dispatcher and Maintenance both read and mutate.
- **Dependencies:** Module 1 (Auth/RBAC).
- **Database Tables Required:** `Vehicle`; polymorphic `Document` (registration, insurance); `AuditLog` (status-change history).
- **APIs Required:** `GET /api/vehicles`, `GET /api/vehicles/:id`, `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` (soft delete), `PATCH /api/vehicles/:id/status`.
- **Frontend Pages Required:** Vehicle Registry list/table view, New Vehicle Registration drawer, Vehicle Detail drawer.
- **Estimated Complexity:** Low–Medium.
- **Common Mistakes:**
  - Hard-deleting vehicles instead of soft-deleting — breaks historical Trip/Maintenance/Expense foreign key integrity.
  - Allowing manual status edits that bypass the "In Shop" lock set by the Maintenance module (status should only be directly editable for Available/Idle/Out of Service; In Shop is system-controlled).
  - Missing a unique constraint on License Plate.
- **Testing Strategy:** CRUD unit tests; constraint tests (duplicate plate rejection); soft-delete regression tests (retired vehicle disappears from dispatch pool but remains in historical reports).

---

### Module 3 — Driver Profiles & Safety

- **Goal:** Manage driver records, license compliance, safety scoring, and duty status — the second master-data entity required for dispatch.
- **Dependencies:** Module 1 (Auth/RBAC). Can be built in parallel with Module 2.
- **Database Tables Required:** `Driver`; `Document` (license upload, polymorphic); `AuditLog`.
- **APIs Required:** `GET /api/drivers`, `GET /api/drivers/:id`, `POST /api/drivers`, `PUT /api/drivers/:id`, `DELETE /api/drivers/:id`, `PATCH /api/drivers/:id/status` (On Duty / Off Duty / Suspended).
- **Frontend Pages Required:** Driver Performance & Safety Profiles table (per Stitch export), Driver Detail/Edit drawer.
- **Estimated Complexity:** Medium (license-expiry logic and safety-score computation add business rules beyond plain CRUD).
- **Common Mistakes:**
  - Not blocking trip assignment server-side when a license is expired (Business Rule 1) — validating this only in the Trip Dispatcher UI is insufficient.
  - Recalculating "Safety Score" ad hoc in the frontend instead of a single backend-owned formula.
  - Allowing a Suspended driver to still appear in the "Assign Driver" dropdown.
- **Testing Strategy:** Unit tests for license-expiry date logic; integration test asserting a Suspended or expired-license driver is excluded from `GET /api/drivers?availableFor=trip`; safety-score calculation unit tests with edge cases (zero trips, all-complaint history).

---

### Module 4 — Maintenance & Service Logs

- **Goal:** Track preventative/reactive service records and own the "In Shop" state transition that removes a vehicle from the dispatch pool.
- **Dependencies:** Module 2 (Vehicle Registry).
- **Database Tables Required:** `Maintenance`; `Vehicle` (status field mutation); `Document` (invoices); `AuditLog`.
- **APIs Required:** `GET /api/maintenance`, `POST /api/maintenance`, `PUT /api/maintenance/:id`, `PATCH /api/maintenance/:id/complete`.
- **Frontend Pages Required:** Maintenance & Service Logs table, Create Service Log drawer (with vehicle-status validation alert, per Stitch export).
- **Estimated Complexity:** Medium (the auto-status-transition side effect is the core piece of business logic).
- **Common Mistakes:**
  - Updating `Maintenance.status` without a transactional update to `Vehicle.status` — leaves the two tables inconsistent if either write fails.
  - Not reverting vehicle status to Available automatically on service completion.
  - Allowing a second open maintenance record to be created for a vehicle already "In Shop."
- **Testing Strategy:** Transaction tests (maintenance-create + vehicle-status-update as one atomic operation, verifying rollback on partial failure); integration test confirming a vehicle "In Shop" is excluded from the Trip Dispatcher's vehicle-selection endpoint; completion-flow test confirming status reverts correctly.

---

### Module 5 — Trip Dispatcher & Management

- **Goal:** Core operational workflow — create, assign, validate, and progress trips through their lifecycle while enforcing capacity and compliance rules.
- **Dependencies:** Module 2 (Vehicle Registry), Module 3 (Driver Profiles), Module 4 (Maintenance, for availability filtering).
- **Database Tables Required:** `Trip`; reads `Vehicle`, `Driver`; `AuditLog`; `Notification` (dispatch alerts).
- **APIs Required:** `GET /api/trips`, `POST /api/trips`, `PUT /api/trips/:id`, `PATCH /api/trips/:id/status`.
- **Frontend Pages Required:** Trip Dispatcher & Management table, Dispatch New Trip form (with live capacity-validation error, per Stitch export).
- **Estimated Complexity:** High — this module encodes the most business rules of any in the system (capacity check, driver availability, license validity, vehicle availability, lifecycle state machine).
- **Common Mistakes:**
  - Performing the `CargoWeight > MaxCapacity` check only client-side (Business Rule 4 must be enforced server-side).
  - Allowing a Draft trip to hold a "soft lock" on a vehicle/driver that is never released if the draft is abandoned.
  - Skipping the license-validity re-check at dispatch time (a license could expire between driver creation and trip assignment).
  - Not modeling the lifecycle as an explicit state machine (Draft → Dispatched → Completed / Cancelled), leading to invalid status jumps.
- **Testing Strategy:** State-machine unit tests covering every valid and invalid transition; integration tests for the full "Vehicle Intake → Compliance → Dispatch → Completion" workflow described in the PDF's Logic & Workflow Summary; load test for concurrent dispatch attempts on the same vehicle (race-condition check, since availability must be atomically claimed).

---

### Module 6 — Fuel & Expense Logging

- **Goal:** Record fuel and miscellaneous expenses tied to completed trips/vehicles and compute per-vehicle operational cost.
- **Dependencies:** Module 5 (Trip Dispatcher — expenses are logged against completed trips), Module 2 (Vehicle Registry).
- **Database Tables Required:** `FuelLog`, `Expense`; reads `Trip`, `Vehicle`.
- **APIs Required:** `GET /api/expenses`, `POST /api/expenses`, `GET /api/fuel-logs`, `POST /api/fuel-logs`.
- **Frontend Pages Required:** Expense & Fuel Logging table, Add an Expense slide-over drawer (with auto-filled driver/vehicle/distance from selected trip, per Stitch export).
- **Estimated Complexity:** Medium.
- **Common Mistakes:**
  - Allowing expenses to be logged against a Draft or Cancelled trip.
  - Recomputing "Total Operational Cost" in the frontend instead of a backend aggregation endpoint — leads to drift between what's displayed and what's stored.
  - Not linking `Expense` to `Vehicle` directly (only via `Trip`) — this breaks reporting when expenses aren't trip-specific (e.g., annual insurance).
- **Testing Strategy:** Unit tests for cost aggregation math (`Fuel + Maintenance + Other`); integration test confirming expense creation is blocked for non-Completed trips; regression test confirming per-vehicle cost totals stay correct after a soft-deleted trip.

---

### Module 7 — Command Center (Main Dashboard)

- **Goal:** High-level, at-a-glance fleet oversight aggregating live data from every module built so far.
- **Dependencies:** Modules 2–6 (it has no data of its own to protect or validate — it is a read/aggregation layer).
- **Database Tables Required:** None new. Read-only aggregation queries against `Vehicle`, `Trip`, `Maintenance`, `Driver`, `Notification`.
- **APIs Required:** `GET /api/analytics/dashboard` (single aggregated KPI payload: Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo, Recent Trips, Vehicle Availability breakdown, License Expiry alerts).
- **Frontend Pages Required:** Command Center dashboard (KPI cards, filter bar, recent trips table, vehicle-availability widget, maintenance-alerts widget, license-expiry widget, activity timeline, utilization/status charts).
- **Estimated Complexity:** Medium (mostly a query-aggregation and frontend-composition exercise, not new business logic).
- **Common Mistakes:**
  - Issuing 6–8 separate API calls per dashboard load instead of one aggregated endpoint — causes waterfall loading and poor perceived performance.
  - Computing "Utilization Rate" inconsistently between the Dashboard and the Analytics module (should share one backend formula/service function).
  - Building this module before its data sources exist, forcing rework once real Vehicle/Trip data lands (this is precisely why it's sequenced 7th).
- **Testing Strategy:** Integration tests on the aggregation endpoint with seeded fixture data verifying each KPI number independently; snapshot/UI tests for empty-state and loading-state rendering; performance test on aggregation query response time under realistic row counts (500+ vehicles per NFR).

---

### Module 8 — Operational Analytics & Financial Reports

- **Goal:** Deep financial and performance reporting: fuel efficiency, ROI, cost-per-km, and exportable monthly reports.
- **Dependencies:** Modules 2–6 fully populated with historical data; benefits from Module 7's aggregation patterns.
- **Database Tables Required:** `MonthlyReport` (denormalized rollup, written by a scheduled job or on-completion trigger); reads `FuelLog`, `Expense`, `Maintenance`, `Trip`, `Vehicle`.
- **APIs Required:** `GET /api/reports/monthly`, `GET /api/analytics/fuel-efficiency`, `GET /api/analytics/roi`, `GET /api/analytics/cost-per-km`, `GET /api/reports/export?format=pdf|csv`.
- **Frontend Pages Required:** Operational Analytics & Financial Reports page (KPI cards, fuel-efficiency trend chart, trip-status distribution, top-5-costliest-vehicles, financial summary table with export dropdown).
- **Estimated Complexity:** High — this is the only module that touches the deliberately denormalized `MonthlyReport` table, and export generation (PDF/CSV) adds an additional engineering surface.
- **Common Mistakes:**
  - Computing ROI/fuel-efficiency live from raw tables on every request instead of leaning on `MonthlyReport` — will not scale past a few hundred vehicles (this is exactly why the denormalization decision was made in Phase 2).
  - Letting `MonthlyReport` silently drift out of sync with source tables (no reconciliation job or recompute-on-demand safety valve).
  - Building CSV/PDF export as a blocking synchronous request for large date ranges instead of a queued/async job.
- **Testing Strategy:** Unit tests for each financial formula (ROI, cost-per-km, fuel efficiency) against hand-calculated fixtures; reconciliation test comparing `MonthlyReport` rollups against a live raw-table aggregation for the same period; export tests validating PDF/CSV structural correctness and large-dataset performance.

---

## 3. Git Strategy

- **Model:** Trunk-based development with short-lived feature branches (not long-lived Git Flow release branches) — appropriate for a small, phase-gated team shipping incrementally per milestone.
- **Trunk branch:** `main` — always deployable. Protected: no direct pushes, requires PR + passing CI + 1 approval.
- **Integration branch:** `develop` — optional; used only if the team wants a staging-aligned integration point before merging to `main`. For a small team, merging feature branches directly to `main` behind feature flags is preferred over maintaining a parallel `develop` branch indefinitely.
- **Feature branches:** Cut from `main`, merged back via PR, deleted after merge. Kept short-lived (target: under 3 days open) to minimize merge drift.
- **Hotfix branches:** Cut from `main` for production-breaking bugs, merged back to `main` immediately with an expedited review.

## 4. Branch Naming Strategy

```
main                          # always deployable
feature/<module>-<short-desc>   e.g. feature/trip-dispatcher-capacity-check
fix/<module>-<short-desc>       e.g. fix/vehicle-status-race-condition
hotfix/<short-desc>             e.g. hotfix/refresh-token-leak
chore/<short-desc>              e.g. chore/eslint-config-update
docs/<short-desc>                e.g. docs/api-endpoint-reference
```

Rules:
- Branch names are lowercase, kebab-case, and always prefixed by type.
- Every branch name should be traceable to a module from Section 1 or a ticket ID if issue tracking is added later.

## 5. Commit Message Strategy — Conventional Commits

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: BREAKING CHANGE, Refs #issue]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `build`, `ci`

**Scopes:** align to module names — `auth`, `vehicle`, `driver`, `maintenance`, `trip`, `expense`, `dashboard`, `analytics`, `db`, `api`.

Examples:
```
feat(trip): enforce cargo weight validation against vehicle capacity
fix(vehicle): prevent hard delete, replace with soft delete flag
refactor(auth): extract refresh token rotation into shared service
test(maintenance): add transactional rollback test for status sync
docs(api): document analytics ROI endpoint response shape
```

Rules:
- One logical change per commit; no bundled unrelated diffs.
- Body explains *why*, not just *what* (the diff already shows what).
- `BREAKING CHANGE:` footer required for any Prisma schema migration that isn't backward compatible.

## 6. Deployment Strategy

- **Environments:** `local` → `staging` → `production`. Staging is a full mirror of production infrastructure at smaller scale.
- **CI/CD Pipeline (per PR to `main`):** lint → type-check → unit tests → integration tests → build → (on merge) deploy to staging → smoke tests → manual promotion to production.
- **Database migrations:** Prisma Migrate, following an **expand-then-contract** pattern for any breaking schema change — add new columns/tables first and dual-write if needed, backfill, switch reads, then drop old columns in a later release. Never a destructive migration in the same deploy that introduces the new shape.
- **Rollback plan:** every production deploy tagged; rollback = redeploy previous tagged build + (if needed) reverse migration script prepared alongside the forward migration, not written after the fact.
- **Feature flags:** used for any module released incrementally (e.g., soft-launching Analytics exports to a subset of Financial Analyst users before general availability).
- **Zero-downtime deploys:** rolling deploy behind a load balancer; health-check endpoint gates traffic cutover.

## 7. Testing Strategy (System-Wide)

- **Unit tests:** business logic in isolation — validation rules, status transitions, financial formulas, RBAC permission checks. Target: fast (<5 min full suite), run on every commit.
- **Integration tests:** API endpoints against a real (containerized) PostgreSQL instance via Prisma — covers the module-specific scenarios listed in Section 2.
- **End-to-end tests:** critical user journeys only (login → dispatch trip → complete trip → log expense → see dashboard update) — not exhaustive, kept small and stable.
- **Contract tests:** frontend/backend API shape agreement, to catch breaking changes to response payloads before they reach the UI.
- **Test data strategy:** seeded fixtures per module (a small "golden" fleet: a handful of vehicles across each status, drivers across each compliance state, a full trip lifecycle) reused across integration and E2E suites for consistency.
- **Coverage target:** business-logic-heavy modules (Trip Dispatcher, Analytics) held to a higher bar than CRUD-only modules (Vehicle Registry).

## 8. Performance Optimization Checklist

- [ ] Index every foreign key and every column used in a `WHERE`/`ORDER BY` on high-traffic queries (Vehicle.status, Trip.status, Driver.status, Maintenance.status).
- [ ] Paginate all list endpoints server-side; never return unbounded result sets (per the 500+ vehicle NFR).
- [ ] Use Prisma `select`/`include` deliberately — avoid over-fetching relations not needed by the requesting view.
- [ ] Eliminate N+1 queries in aggregation endpoints (Dashboard, Analytics) via batched Prisma queries or raw SQL aggregation where needed.
- [ ] Cache the Dashboard aggregation payload for short TTLs (e.g., 30–60s) to absorb repeated polling without re-hitting the database each time.
- [ ] Lean on `MonthlyReport` for Analytics reads instead of live aggregation across raw tables.
- [ ] Connection pooling configured appropriately for concurrent-user NFR (500+ vehicles, multiple simultaneous roles).
- [ ] Frontend: code-split by route/module; lazy-load the Analytics and Dashboard chart libraries.
- [ ] Frontend: debounce search/filter inputs on all table toolbars (Vehicle Registry, Trip Dispatcher, Driver Profiles all use live search per the Stitch exports).
- [ ] Response time budget: sub-2-second target enforced by the NFR — track via APM on every endpoint, not just spot-checked.

## 9. Security Checklist

- [ ] Passwords hashed with bcrypt/argon2; never logged, never returned in any API response.
- [ ] JWT access tokens short-lived; refresh tokens stored hashed, rotated on every use, revocable on logout/password-change.
- [ ] RBAC enforced server-side on every route per the Section 5 permission matrix from the SRS — frontend hiding is UX only, never the security boundary.
- [ ] All inputs validated at the API boundary (schema validation) before touching Prisma — never trust client-supplied IDs, statuses, or numeric fields (cargo weight, capacity).
- [ ] SQL injection: mitigated by Prisma's parameterized queries by default; any raw SQL (e.g., analytics aggregations) must be parameterized, never string-concatenated.
- [ ] XSS: sanitize/escape any user-supplied free text rendered in the UI (Notes fields, driver names, issue descriptions).
- [ ] Rate limiting on `/api/auth/*` endpoints to blunt credential-stuffing/brute-force attempts.
- [ ] CORS locked to known frontend origins per environment.
- [ ] Security headers (Helmet or equivalent): CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- [ ] File uploads (license documents, invoices via the polymorphic `Document` table) validated for type/size and stored outside the web root with signed, time-limited access URLs.
- [ ] `AuditLog` captures every status-changing action (vehicle status, trip lifecycle, driver suspension) with actor, timestamp, and before/after values — required for the Safety Officer/Financial Analyst compliance workflows.
- [ ] Secrets (DB credentials, JWT signing keys) in environment-managed secret storage, never committed, never hardcoded.
- [ ] All traffic over HTTPS; no mixed content.

## 10. Production Readiness Checklist

- [ ] Environment-specific config validated at boot (fail fast if a required env var is missing).
- [ ] Centralized structured logging (request IDs threaded through for traceability).
- [ ] Error tracking/alerting wired to a monitoring service; alert thresholds defined for 5xx rate and latency.
- [ ] Automated, tested database backups with a documented restore procedure (per NFR).
- [ ] `/health` and `/ready` endpoints for load-balancer and orchestrator checks.
- [ ] Load-tested against the 500+ vehicle / concurrent-user NFR before go-live.
- [ ] Runbook documented for the top failure modes (DB connection exhaustion, refresh-token service outage, stuck "In Shop" vehicle needing manual override).
- [ ] Rollback procedure rehearsed at least once in staging before first production deploy.
- [ ] 99% uptime target (per NFR) mapped to actual monitoring/alerting SLOs, not just an aspirational number.
- [ ] Data retention/soft-delete cleanup policy documented (soft-deleted vehicles/trips retained for audit, not purged silently).

## 11. Future Enhancement Ideas

Carried forward from the SRS and Phase 5 architectural notes, roughly in order of likely value:

1. **`TripAssignment` junction table** — introduces proper many-to-many Trip↔Driver history (e.g., relief drivers, multi-leg trips) once the current one-driver-per-trip model needs to flex.
2. **Live GPS tracking & map integration** — highest-impact operational upgrade; depends on a device/telemetry ingestion pipeline not yet in scope.
3. **Predictive maintenance (AI-based)** — layers on top of the existing `Maintenance` history once enough data has accumulated.
4. **Driver mobile application** — for On Duty status updates, trip acceptance, and odometer/fuel entry directly from the field.
5. **Route optimization** — natural extension once GPS data exists.
6. **Email/SMS notifications** — expands the existing `Notification` table from in-app-only to multi-channel delivery.
7. **Real-time fleet alerts** — WebSocket/SSE layer over the Dashboard aggregation endpoint for live KPI updates instead of polling.
8. **Multi-tenant (multi-company) support** — significant architectural change; would require a `Company`/`Organization` scoping layer across every table.
9. **QR-code vehicle identification** — quick win for field check-in/check-out workflows.
10. **Inventory / spare-parts management** — extends the Maintenance module with parts consumption tracking.

---

## 12. Milestone-Based Roadmap

### Milestone 1 — Foundation & Authentication
Scope: Project scaffolding (folder structure per Phase 1), database provisioning, `Role`/`User`/`RefreshToken` schema, full Auth module (Module 1), CI pipeline bootstrap, RBAC middleware.
Exit criteria: All 4 roles can log in, receive correctly scoped tokens, and are blocked from unauthorized routes with passing RBAC test matrix.

### Milestone 2 — Master Data: Vehicles & Drivers
Scope: Vehicle Registry (Module 2) and Driver Profiles (Module 3) built in parallel, including Document upload and AuditLog wiring.
Exit criteria: Full CRUD on both entities in staging with realistic seed data; license-expiry and soft-delete rules verified by tests.

### Milestone 3 — Maintenance & Vehicle Lifecycle
Scope: Maintenance module (Module 4), including the transactional "In Shop" status-lock logic.
Exit criteria: Creating a service record correctly removes a vehicle from dispatch availability; completion correctly restores it; all transaction-rollback tests passing.

### Milestone 4 — Trip Dispatcher & Core Business Rules
Scope: Trip Dispatcher (Module 5) — the highest-complexity module — including the full lifecycle state machine and all four cross-cutting validation rules (capacity, vehicle availability, driver availability, license validity).
Exit criteria: End-to-end trip lifecycle (Draft → Dispatched → Completed/Cancelled) demonstrable in staging with all business-rule violations correctly rejected server-side.

### Milestone 5 — Financial Logging
Scope: Fuel & Expense Logging (Module 6), tied to completed trips, with per-vehicle cost aggregation.
Exit criteria: Operational cost totals verified accurate against hand-calculated fixtures for a full seeded trip history.

### Milestone 6 — Dashboard & Analytics
Scope: Command Center Dashboard (Module 7) and Operational Analytics & Financial Reports (Module 8), including `MonthlyReport` rollup generation and CSV/PDF export.
Exit criteria: Dashboard aggregation endpoint meets the sub-2-second NFR under realistic data volume; Analytics figures reconcile against raw-table recomputation; exports validated.

### Milestone 7 — Hardening, Testing & Production Launch
Scope: Full security checklist (Section 9), performance checklist (Section 8), production-readiness checklist (Section 10), load testing, staging-to-production rollback rehearsal, documentation finalization.
Exit criteria: All checklists signed off; load test passes NFR targets (500+ vehicles, concurrent users, <2s response); production deploy executed with successful rollback rehearsal on record.

---

*End of Phase 5 deliverable. This document intentionally contains no code, per scope.*
