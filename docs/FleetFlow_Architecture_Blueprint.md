# FleetFlow — Development Blueprint

### Modular Fleet \& Logistics Management System

**Prepared by:** Senior Software Architecture Review
**Stack:** React.js · Tailwind CSS · Node.js · Express.js · PostgreSQL · Prisma ORM · JWT · REST

\---

## TASK 1 — Project Understanding Summary

**Objective:** Replace manual logbooks with a centralized, rule-based digital hub covering the full lifecycle of a delivery fleet — vehicles, drivers, trips, maintenance, fuel/expenses, and financial analytics.

**Core Users:**

|Role|Focus|
|-|-|
|Fleet Manager|Vehicle lifecycle, scheduling, oversight|
|Dispatcher|Trip creation, driver/vehicle assignment|
|Safety Officer|License compliance, driver safety scores|
|Financial Analyst|Fuel/maintenance spend, ROI|

**Core Business Logic Discovered:**

1. A vehicle cannot be dispatched if `CargoWeight > MaxCapacity`.
2. Logging maintenance on a vehicle auto-sets it to `In Shop`, removing it from dispatch pools.
3. A driver with an expired license cannot be assigned to a trip.
4. Trip lifecycle: `Draft → Dispatched → Completed → Cancelled` (SRS also references `Archived` post-completion).
5. Total Operational Cost = Fuel + Maintenance, computed per Vehicle ID.
6. Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
7. Completing a trip requires an odometer reading, which updates vehicle mileage and triggers fuel-efficiency recalculation.

**8 Core Screens identified from the Stitch export:** Login/Register, Command Center (Dashboard), Vehicle Registry (+ registration drawer), Trip Dispatcher, Maintenance \& Service Logs, Fuel \& Expense Logging, Driver Performance \& Safety Profiles, Operational Analytics \& Financial Reports.

\---

## TASK 2 — Screen-by-Screen Analysis

### 2.1 Login \& Registration

**Purpose:** Secure, role-aware entry point into the system.

**UI Components:** Role selector (Fleet Manager / Dispatcher / Safety Officer / Financial Analyst radio-cards), email input, password input with visibility toggle, "Remember this device" checkbox, "Forgot Password" link, submit button with loading state, registration variant with company name, phone, password-strength meter, terms checkbox.

**User Actions:** Sign in, toggle password visibility, request password reset, register new organization account, select access role.

**Navigation:** Success → Command Center (Dashboard). Registration → Login.

**Required APIs:**

* `POST /api/auth/login`
* `POST /api/auth/logout`
* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password`
* `POST /api/auth/register`

**Database Tables:** `User`, `Role`, `Organization` (if multi-tenant is added), `RefreshToken`/`Session`.

**Validations:**

* Frontend: required email format, min password length, matching confirm-password, terms checkbox required.
* Backend: email uniqueness, bcrypt password hashing, rate-limiting on login attempts, JWT signing with role claims.

**Business Rules:** The selected "role" on login is cosmetic UI framing only — actual authorization must be derived server-side from the `User.roleId`, never trusted from the client payload.

\---

### 2.2 Command Center (Main Dashboard)

**Purpose:** At-a-glance operational health of the entire fleet.

**UI Components:** KPI cards (Active Fleet, Maintenance Alerts, Pending Cargo, Fleet Utilization with progress bar), filter bar (Vehicle Type, Status, Region, Date Range), Recent Trips table (paginated), Vehicle Availability widget (stacked bar), Urgent Maintenance widget, License Expiry widget, Fleet Utilization Trend bar chart, Trip Status Distribution donut chart, Recent Activity timeline, "New Vehicle" / "New Trip" quick-action buttons.

**User Actions:** Filter fleet view, drill into a trip, jump to vehicle/driver registration, view maintenance schedule, renew a license, export.

**Navigation:** Links out to Vehicle Registry, Trip Dispatcher, Maintenance, Driver Profiles.

**Required APIs:**

* `GET /api/analytics/dashboard` (aggregated KPIs)
* `GET /api/trips?limit=\&status=\&sort=recent`
* `GET /api/vehicles/availability-summary`
* `GET /api/maintenance?status=urgent`
* `GET /api/drivers/license-expiry?withinDays=7`

**Database Tables:** `Vehicle`, `Trip`, `Maintenance`, `Driver`, `Expense`, `FuelLog` (aggregated read-only queries).

**Validations:** Date-range filter must resolve to a valid start ≤ end; region/type filters constrained to enum values.

**Business Rules:** Utilization % = (vehicles On Trip) / (total active, non-retired vehicles). Maintenance Alerts count only vehicles currently `In Shop`, with a "Critical" sub-count for overdue services.

\---

### 2.3 Vehicle Registry (Asset Management)

**Purpose:** CRUD for the physical fleet asset inventory.

**UI Components:** Summary stat cards (Total/Available/On Trip/Under Maintenance), search bar, filter selects (Type, Status, Capacity), data table (Vehicle ID, License Plate, Name, Manufacturer/Model, Type, Capacity, Odometer, Status pill, row actions), pagination, slide-over registration drawer (Vehicle Name, License Plate, Manufacturer, Model, Year, Vehicle Type, Fuel Type, Max Load Capacity + unit, Initial Odometer, Color, Registration Date, Insurance Expiry, Status radio, Notes), view-details drawer (asset health bars, upcoming service), success toast.

**User Actions:** Add, edit, view, retire ("Out of Service" toggle), search, filter, export fleet data, assign driver shortcut.

**Navigation:** "Assign Driver" → Trip Dispatcher. "Schedule Now" → Maintenance.

**Required APIs:**

* `GET /api/vehicles`
* `GET /api/vehicles/:id`
* `POST /api/vehicles`
* `PUT /api/vehicles/:id`
* `PATCH /api/vehicles/:id/status`
* `DELETE /api/vehicles/:id`

**Database Tables:** `Vehicle`, `Maintenance` (for health/upcoming service panel), `Trip` (history).

**Validations:**

* Frontend: License Plate required + pattern-matched, Max Load Capacity > 0, Manufacturing Year within reasonable range, required Vehicle Type/Fuel Type selection.
* Backend: License Plate **unique constraint**, capacity stored in normalized unit (kg), status transitions validated against a finite-state enum.

**Business Rules:** Vehicles cannot be manually set to `Available` while an open (non-completed) Maintenance record exists against them — that flag is system-controlled. "Out of Service" is a manual, permanent-ish retirement toggle distinct from `In Shop`.

\---

### 2.4 Trip Dispatcher \& Management

**Purpose:** Workflow engine for moving cargo from origin to destination.

**UI Components:** Group-by/filter/sort toolbar, trips table (Trip ID, Vehicle Type, Origin, Destination, Driver, Cargo Weight, Status pill, actions), pagination, "Dispatch New Trip" form (Vehicle select, Cargo Weight input with real-time capacity-violation warning, Driver select, Origin/Destination address, read-only Est. Fuel Cost \& Distance, Trip Date/Time, Notes), safety-parameter confirmation banner, "Save as Draft" and "Confirm \& Dispatch" actions.

**User Actions:** Create trip (draft or dispatch), assign vehicle + driver, view/edit trip, cancel trip, mark complete (implied downstream on Fuel/Expense screen), filter/group/sort.

**Navigation:** Completion flow → Fuel \& Expense Logging (to record trip costs).

**Required APIs:**

* `GET /api/trips`
* `GET /api/trips/:id`
* `POST /api/trips`
* `PUT /api/trips/:id`
* `PATCH /api/trips/:id/status`
* `DELETE /api/trips/:id` (drafts only)
* `GET /api/vehicles?status=available`
* `GET /api/drivers?status=available\&licenseValid=true`

**Database Tables:** `Trip`, `Vehicle`, `Driver`, `TripAssignment` (junction if trips can involve co-drivers/multi-leg), `FuelLog`.

**Validations:**

* Frontend: real-time `CargoWeight > MaxCapacity` check blocks submission with visible error (as shown in the UI mock).
* Backend (authoritative — never trust client-side check alone):

  1. Vehicle status must be `Available`.
  2. Driver status must be `On Duty`/`Available`.
  3. Driver license must not be expired.
  4. `CargoWeight ≤ Vehicle.MaxCapacity`.
  5. Driver's licensed vehicle category must match vehicle type.

**Business Rules:** On successful dispatch: `Vehicle.status → On Trip`, `Driver.status → On Trip`. On completion: both revert to `Available`, odometer is updated, and a `FuelLog`/cost-per-km recalculation is triggered. Trip lifecycle: `Draft → Dispatched → Completed → Archived`, or `Draft → Cancelled`.

\---

### 2.5 Maintenance \& Service Logs

**Purpose:** Preventative and reactive vehicle health tracking.

**UI Components:** Search/filter toolbar (Vehicle Type, Service Type, Status, Date Range, Sort), 4 KPI cards (Total Service Logs, Vehicles In Maintenance, Upcoming Services, Total Maintenance Cost), service log table (Log ID, Vehicle, Service Type, Date, Cost, Status pill, Actions — rows for active maintenance are visually flagged with a red left-border + "Dispatch Locked" tag), "Create New Service" slide-over drawer (Vehicle select with dispatch-lock warning banner, License Plate auto-fill, Service Type, Priority, Issue Description, Service Date, Est. Completion, Technician, Workshop, Est. Cost, Status select, Notes).

**User Actions:** Create service log, edit, view, mark complete, view repair history, invoice lookup.

**Navigation:** Locks the vehicle out of Trip Dispatcher's selection pool while active.

**Required APIs:**

* `GET /api/maintenance`
* `GET /api/maintenance/:id`
* `POST /api/maintenance`
* `PUT /api/maintenance/:id`
* `PATCH /api/maintenance/:id/complete`

**Database Tables:** `Maintenance`, `Vehicle` (status side-effect), `Expense` (cost roll-up).

**Validations:** Vehicle selection required; Service Date ≤ Est. Completion Date; Cost ≥ 0; Status enum (`Draft`, `Scheduled`, `In Progress`, `Awaiting Parts`, `Completed`).

**Business Rules:** Creating (or transitioning a maintenance record into) an active state auto-sets `Vehicle.status = In Shop` and removes it from the Trip Dispatcher's available-vehicle query. Marking the service `Completed` reverts `Vehicle.status = Available` (unless another open maintenance record still exists) and rolls the cost into the vehicle's Total Operational Cost.

\---

### 2.6 Fuel \& Expense Logging (Completed Trip Expenses)

**Purpose:** Financial tracking per completed trip and per vehicle.

**UI Components:** Search toolbar (Trip ID/Driver, Group By, Filter by status, Sort), expense table (Trip ID, Driver avatar+name, Distance, Fuel Expense, Misc Expense, Status pill, Actions), pagination, "Add an Expense" slide-over drawer (Trip ID select limited to completed trips, read-only Driver/Vehicle/Distance auto-fill, Fuel Quantity (L), Fuel Cost, Expense Category select, Misc Expense, Expense Date, Notes).

**User Actions:** Log a new expense against a completed trip, view/edit existing entries.

**Navigation:** Sourced from completed Trip Dispatcher records; feeds Operational Analytics.

**Required APIs:**

* `GET /api/expenses`
* `POST /api/expenses`
* `PUT /api/expenses/:id`
* `GET /api/trips?status=Completed` (populate Trip ID dropdown)
* `GET /api/fuel-logs`
* `POST /api/fuel-logs`

**Database Tables:** `Expense`, `FuelLog`, `Trip`, `Vehicle`, `Driver`.

**Validations:** Trip must be status `Completed` to appear in the selector; Fuel Quantity and Cost ≥ 0; Expense Category constrained to enum (Fuel, Repair, Toll, Parking, Food, Other).

**Business Rules:** `Total Operational Cost (per vehicle) = Σ Fuel + Σ Maintenance + Σ Other Expenses`. Fuel efficiency (km/L) recalculates per vehicle after each new fuel log tied to a completed trip.

\---

### 2.7 Driver Performance \& Safety Profiles

**Purpose:** HR/compliance and safety-score tracking for drivers.

**UI Components:** Search/filter/sort/group toolbar, driver table (Photo+Name+ID, License Number, License Expiry with "Expiring Soon"/"Expired" flags, Trip Completion % progress bar, Safety Score badge, Complaints count, Duty Status indicator, row actions: View/Edit/Suspend/Activate/Delete), pagination.

**User Actions:** View profile, edit, suspend/reactivate, delete, filter by duty status/expiry.

**Navigation:** Feeds Trip Dispatcher's driver-assignment eligibility.

**Required APIs:**

* `GET /api/drivers`
* `GET /api/drivers/:id`
* `POST /api/drivers`
* `PUT /api/drivers/:id`
* `PATCH /api/drivers/:id/status`
* `DELETE /api/drivers/:id`
* `POST /api/drivers/:id/license` (upload/renew)

**Database Tables:** `Driver`, `Trip` (completion-rate + safety-score derivation), `Complaint`/`Incident` (if tracked as its own table).

**Validations:** License Number unique per issuing state; License Expiry must be a future date on renewal; Safety Score bounded 0–100; Duty Status enum (`On Duty`, `Off Duty`, `Suspended`).

**Business Rules:**

1. A driver whose license is expired is automatically ineligible for trip assignment (enforced at Trip creation, not just visually flagged here).
2. `Suspended` status hard-blocks assignment regardless of license validity.
3. Trip Completion % and Safety Score are derived/rollup fields — recalculated from `Trip` history, not directly editable.

\---

### 2.8 Operational Analytics \& Financial Reports

**Purpose:** Data-driven decision support and compliance-ready exports.

**UI Components:** Date-range filter ("This Quarter"), 3 KPI cards (Total Fuel Cost, Fleet ROI, Fleet Utilization Rate), Fuel Efficiency Trend line chart, Top 5 Costliest Vehicles bar-list, Financial Summary table (Month, Revenue, Fuel Cost, Maintenance Cost, Net Profit pill), Export dropdown (PDF / Excel / CSV).

**User Actions:** Change reporting period, export report (PDF/CSV/Excel), drill into a monthly row.

**Navigation:** Terminal screen — surfaces data aggregated from all other modules.

**Required APIs:**

* `GET /api/analytics/dashboard`
* `GET /api/reports/monthly?month=\&year=`
* `GET /api/reports/vehicle/:id`
* `GET /api/reports/driver/:id`
* `GET /api/reports/export?format=pdf|csv|xlsx`

**Database Tables:** Reads across `Trip`, `Vehicle`, `Expense`, `FuelLog`, `Maintenance` — likely materialized into a `MonthlyReport`/aggregation table for performance at scale.

**Validations:** Date range required and bounded to available data; export format restricted to supported enum.

**Business Rules:**

* Fuel Efficiency = distance traveled / fuel consumed (km/L), computed per completed trip and rolled up monthly.
* Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
* Net Profit = Revenue − (Fuel Cost + Maintenance Cost).

\---

## TASK 3 — Functional Requirements (Consolidated)

|Module|Key Functions|
|-|-|
|**Authentication**|Login, logout, forgot/reset password, JWT issuance + refresh, RBAC middleware|
|**Dashboard**|Real-time KPI aggregation, filterable fleet snapshot, charts, activity feed|
|**Vehicle Management**|CRUD, status lifecycle, capacity/plate validation, retirement|
|**Driver Management**|CRUD, license tracking/expiry alerts, safety score, duty status, suspension|
|**Trip Management**|Create/assign/dispatch/complete/cancel, capacity + license + availability validation, lifecycle state machine|
|**Maintenance**|Service log CRUD, auto vehicle-lock on active maintenance, cost tracking|
|**Fuel \& Expense**|Fuel log + misc expense CRUD tied to completed trips, cost roll-ups|
|**Reports \& Analytics**|KPI computation, trend charts, monthly financial summary, PDF/CSV/Excel export|
|**Notifications** *(not in UI, recommended addition)*|License expiry, maintenance due, cargo-overload rejection alerts|
|**Role Management**|Role-permission matrix enforcement across every module|

\---

## TASK 4 — Non-Functional Requirements

|Category|Requirement|
|-|-|
|**Performance**|API response < 2s under normal load; dashboard aggregation queries indexed and/or cached (Redis) at scale|
|**Scalability**|Support 500+ vehicles, horizontal scaling of the Express API behind a load balancer; stateless JWT auth enables multi-instance deployment|
|**Security**|JWT (short-lived access + refresh token rotation), bcrypt password hashing (cost factor ≥ 12), RBAC middleware on every route, Prisma parameterized queries (SQL-injection safe by design), Helmet + CORS whitelist, input validation (Zod/Joi), rate limiting on auth endpoints|
|**Availability**|99% uptime target; cloud deployment with health-check endpoints and auto-restart|
|**Reliability**|Automated nightly DB backups, structured error logging (Winston/Pino), centralized error-handling middleware, idempotent status-transition endpoints|
|**Maintainability**|Layered architecture (controller → service → repository), consistent naming, typed DTOs, documented API contracts (OpenAPI/Swagger)|
|**Usability**|Consistent design system (per `DESIGN.md`), responsive breakpoints (desktop/tablet/mobile per Fluid Grid spec), accessible form labeling|
|**Responsiveness**|12-col desktop / 8-col tablet / 4-col mobile grid, sticky bottom nav on mobile per the Dashboard mock|
|**Data Integrity**|Foreign-key constraints, unique constraints (license plate, license number, email), transactional writes for multi-table operations (e.g., dispatch: Trip insert + Vehicle/Driver status update in one DB transaction)|
|**Backup Strategy**|Daily automated PostgreSQL dumps + point-in-time recovery (WAL archiving) on managed DB (RDS/Supabase/Neon)|

\---

## TASK 5 — RBAC Permission Matrix

|Module|Fleet Manager|Dispatcher|Safety Officer|Financial Analyst|
|-|-|-|-|-|
|Dashboard|Read|Read|Read|Read|
|Vehicles|Full (C/R/U/D)|Read|Read|Read|
|Drivers|Full|Read|Full|Read|
|Trips|Read, Approve|Full (C/R/U)|Read|Read|
|Maintenance|Full|Read|Read|Read|
|Expenses|Read|Read|Read|Full|
|Reports|Full, Export|Limited (own trips)|Limited (safety reports)|Full, Export|
|Manage Users|Full (org admin)|—|—|—|
|Approve Trips|✅|—|—|—|
|Suspend Driver|—|—|✅|—|
|Export Financials|✅|—|—|✅|

**Enforcement pattern:** every Express route wrapped with `authenticate` (verifies JWT) → `authorize(\['ROLE\_A','ROLE\_B'])` middleware → controller. Row-level restrictions (e.g., Dispatcher sees only trips they created) are enforced inside the service layer via a `scope` filter, not just route-level gating.

\---

## TASK 6 — Business Workflow

```
Login → RBAC Check → Dashboard
                         │
     ┌───────────────────┼────────────────────┐
     ▼                   ▼                     ▼
Vehicle Registration  Driver Registration   Maintenance Log
     │                   │                     │
     └─────────┬─────────┘                     │
               ▼                                │
        Trip Creation (Dispatcher)              │
               │                                │
   Validate: Vehicle Available? ── No ──► Blocked, vehicle shows "In Shop"
               │ Yes                            │
   Validate: Driver Available + License Valid? ─ No ─► Blocked
               │ Yes                            │
   Validate: CargoWeight ≤ MaxCapacity? ── No ──► Blocked, error shown
               │ Yes
        Trip Dispatched (Vehicle/Driver → On Trip)
               │
        Trip Completed (odometer entered)
               │
        Fuel/Expense Logged ──► Cost-per-km recalculated
               │
        Vehicle/Driver → Available again
               │
        Analytics \& Reports Updated (nightly + on-demand)
```

**Transition notes:**

* Every status transition (`Vehicle.status`, `Driver.status`, `Trip.status`) should be wrapped in a single DB transaction to prevent race conditions (e.g., two dispatchers assigning the same vehicle simultaneously).
* Maintenance can interrupt the cycle at any point a vehicle is `Available`, forcing it to `In Shop` until resolved.

\---

## TASK 7 — Database Planning (PostgreSQL via Prisma)

### 7.1 `User`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK, default `gen\_random\_uuid()`|
|fullName|VARCHAR(120)|NOT NULL|
|email|VARCHAR(160)|UNIQUE, NOT NULL|
|passwordHash|TEXT|NOT NULL|
|roleId|UUID|FK → Role.id|
|companyName|VARCHAR(160)|NULLABLE|
|phone|VARCHAR(30)|NULLABLE|
|isActive|BOOLEAN|DEFAULT true|
|createdAt / updatedAt|TIMESTAMP|DEFAULT now()|

*Reason:* Central identity table; one-to-many with `Role`.

### 7.2 `Role`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|name|VARCHAR(40)|UNIQUE (`FleetManager`, `Dispatcher`, `SafetyOfficer`, `FinancialAnalyst`)|
|permissions|JSONB|Serialized permission matrix for fine-grained checks|

### 7.3 `Vehicle`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|name|VARCHAR(120)|NOT NULL|
|licensePlate|VARCHAR(20)|UNIQUE, NOT NULL, INDEX|
|manufacturer|VARCHAR(80)||
|model|VARCHAR(80)||
|year|INT||
|type|ENUM|`Truck, Van, Bike, HeavyTruck, DeliveryScooter`|
|fuelType|ENUM|`Diesel, Electric, Gasoline, Hydrogen`|
|maxCapacityKg|DECIMAL(10,2)|NOT NULL, CHECK > 0|
|odometerKm|DECIMAL(10,2)|DEFAULT 0|
|status|ENUM|`Available, OnTrip, InShop, OutOfService` DEFAULT `Available`, INDEX|
|registrationDate|DATE||
|insuranceExpiry|DATE|INDEX (for expiry alerts)|
|notes|TEXT|NULLABLE|
|createdAt / updatedAt|TIMESTAMP||

*Reason:* Core asset entity; parent to Trip, Maintenance, FuelLog, Expense.

### 7.4 `Driver`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|userId|UUID|FK → User.id, NULLABLE (if driver has portal login)|
|fullName|VARCHAR(120)|NOT NULL|
|contact|VARCHAR(30)||
|licenseNumber|VARCHAR(40)|UNIQUE, NOT NULL, INDEX|
|licenseCategory|VARCHAR(20)|matches Vehicle.type eligibility|
|licenseExpiry|DATE|NOT NULL, INDEX|
|experienceYears|INT||
|safetyScore|INT|DEFAULT 100, CHECK 0–100|
|tripCompletionRate|DECIMAL(5,2)|DEFAULT 0|
|complaintsCount|INT|DEFAULT 0|
|status|ENUM|`OnDuty, OffDuty, Suspended, OnTrip` DEFAULT `OffDuty`|
|createdAt / updatedAt|TIMESTAMP||

### 7.5 `Trip`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|tripCode|VARCHAR(20)|UNIQUE (e.g., `TR-8921`)|
|vehicleId|UUID|FK → Vehicle.id|
|driverId|UUID|FK → Driver.id|
|origin|VARCHAR(200)|NOT NULL|
|destination|VARCHAR(200)|NOT NULL|
|cargoWeightKg|DECIMAL(10,2)|NOT NULL, CHECK > 0|
|distanceKm|DECIMAL(10,2)|NULLABLE (est. → actual on completion)|
|status|ENUM|`Draft, Dispatched, Completed, Cancelled, Archived` DEFAULT `Draft`, INDEX|
|dispatchedAt|TIMESTAMP|NULLABLE|
|completedAt|TIMESTAMP|NULLABLE|
|odometerAtCompletion|DECIMAL(10,2)|NULLABLE|
|createdBy|UUID|FK → User.id|
|createdAt / updatedAt|TIMESTAMP||

*Indexes:* `(vehicleId, status)`, `(driverId, status)` for fast availability checks.

### 7.6 `Maintenance`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|logCode|VARCHAR(20)|UNIQUE|
|vehicleId|UUID|FK → Vehicle.id|
|serviceType|ENUM|`OilChange, EngineRepair, TireReplacement, BrakeService, GeneralService`|
|priority|ENUM|`Low, Normal, High, Critical`|
|description|TEXT||
|serviceDate|DATE|NOT NULL|
|estCompletionDate|DATE||
|technician|VARCHAR(100)||
|workshop|VARCHAR(150)||
|cost|DECIMAL(10,2)|DEFAULT 0|
|status|ENUM|`Scheduled, InProgress, AwaitingParts, Completed` DEFAULT `Scheduled`|
|createdAt / updatedAt|TIMESTAMP||

### 7.7 `FuelLog`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|tripId|UUID|FK → Trip.id, NULLABLE|
|vehicleId|UUID|FK → Vehicle.id|
|liters|DECIMAL(8,2)|NOT NULL|
|cost|DECIMAL(10,2)|NOT NULL|
|logDate|DATE|NOT NULL|
|createdAt|TIMESTAMP||

### 7.8 `Expense`

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|tripId|UUID|FK → Trip.id, NULLABLE|
|vehicleId|UUID|FK → Vehicle.id|
|category|ENUM|`Fuel, Maintenance, Toll, Insurance, Parking, Food, Other`|
|amount|DECIMAL(10,2)|NOT NULL|
|expenseDate|DATE|NOT NULL|
|notes|TEXT|NULLABLE|
|createdBy|UUID|FK → User.id|
|createdAt|TIMESTAMP||

### 7.9 `Report` *(optional materialized aggregation table)*

|Column|Type|Constraints|
|-|-|-|
|id|UUID|PK|
|periodMonth|DATE|(first of month)|
|revenue|DECIMAL(12,2)||
|fuelCost|DECIMAL(12,2)||
|maintenanceCost|DECIMAL(12,2)||
|netProfit|DECIMAL(12,2)||
|generatedAt|TIMESTAMP||

*Reason:* Pre-computed monthly rollups avoid expensive live aggregation on the Analytics screen at scale; regenerated via a nightly job.

**Normalization note:** Schema is in 3NF — no repeating groups, all non-key attributes depend only on the primary key, and derived values (safety score, utilization %, ROI) are either computed on read or stored redundantly only in the `Report` rollup table for performance, never as the source of truth.

\---

## TASK 8 — Entity Relationship Diagram

```
User (1) ──── (M) Trip            \[createdBy]
User (M) ──── (1) Role            \[roleId]
User (1) ──── (0..1) Driver       \[optional portal login]

Vehicle (1) ──── (M) Trip
Vehicle (1) ──── (M) Maintenance
Vehicle (1) ──── (M) FuelLog
Vehicle (1) ──── (M) Expense

Driver (1) ──── (M) Trip

Trip (1) ──── (0..M) FuelLog
Trip (1) ──── (0..M) Expense
```

**Cardinality rationale:**

* **Vehicle → Trip (1:M):** one vehicle serves many trips over its lifetime, but a given trip has exactly one assigned vehicle.
* **Driver → Trip (1:M):** same logic for drivers; no many-to-many needed since each trip has a single primary driver (co-driver support would require a `TripAssignment` junction table as a future enhancement).
* **Vehicle → Maintenance (1:M):** full service history per asset.
* **Trip → Expense/FuelLog (1:0..M):** expenses can exist independent of a trip (e.g., insurance), hence nullable FK — this is the one true optional relationship in the model.
* **User → Role (M:1):** many users share a role; permissions live centrally on `Role`.

No native many-to-many relationships exist in the current scope. If **multi-driver trips** or **multi-tenant organizations** are added later, `TripAssignment` and `Organization` junction tables become necessary.

\---

## TASK 9 — REST API Planning (Module-wise)

### Authentication

|Method|Endpoint|Auth|Role|Description|
|-|-|-|-|-|
|POST|`/api/auth/register`|No|—|Create org account + first user|
|POST|`/api/auth/login`|No|—|Returns access + refresh JWT|
|POST|`/api/auth/logout`|Yes|Any|Invalidates refresh token|
|POST|`/api/auth/forgot-password`|No|—|Sends reset email|
|POST|`/api/auth/reset-password`|No|—|Consumes reset token|

Errors: `400` validation, `401` invalid credentials, `409` email exists.

### Vehicles

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/vehicles`|Any|List + filter/paginate|
|GET|`/api/vehicles/:id`|Any|Detail|
|POST|`/api/vehicles`|Manager|Create|
|PUT|`/api/vehicles/:id`|Manager|Update|
|PATCH|`/api/vehicles/:id/status`|Manager|Retire/reactivate|
|DELETE|`/api/vehicles/:id`|Manager|Soft delete|

Errors: `404` not found, `409` duplicate plate, `422` invalid capacity.

### Drivers

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/drivers`|Any|List + filter|
|GET|`/api/drivers/:id`|Any|Detail|
|POST|`/api/drivers`|Manager, SafetyOfficer|Create|
|PUT|`/api/drivers/:id`|Manager, SafetyOfficer|Update|
|PATCH|`/api/drivers/:id/status`|SafetyOfficer|Suspend/activate|
|DELETE|`/api/drivers/:id`|Manager|Remove|

Errors: `409` duplicate license, `422` expired license on activate attempt.

### Trips

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/trips`|Any|List + filter|
|GET|`/api/trips/:id`|Any|Detail|
|POST|`/api/trips`|Dispatcher|Create draft/dispatch|
|PUT|`/api/trips/:id`|Dispatcher|Edit draft|
|PATCH|`/api/trips/:id/status`|Dispatcher, Manager|Dispatch/complete/cancel|
|DELETE|`/api/trips/:id`|Dispatcher|Delete draft only|

Errors: `422` cargo exceeds capacity, `409` vehicle/driver unavailable, `403` expired license.

### Maintenance

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/maintenance`|Any|List|
|POST|`/api/maintenance`|Manager|Create → locks vehicle|
|PUT|`/api/maintenance/:id`|Manager|Update|
|PATCH|`/api/maintenance/:id/complete`|Manager|Complete → unlocks vehicle|

### Expenses \& Fuel

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/expenses`|Any|List|
|POST|`/api/expenses`|FinancialAnalyst, Manager|Create|
|GET|`/api/fuel-logs`|Any|List|
|POST|`/api/fuel-logs`|FinancialAnalyst, Manager|Create|

### Analytics \& Reports

|Method|Endpoint|Role|Description|
|-|-|-|-|
|GET|`/api/analytics/dashboard`|Any|KPI snapshot|
|GET|`/api/reports/monthly`|Manager, FinancialAnalyst|Monthly financials|
|GET|`/api/reports/vehicle/:id`|Manager, FinancialAnalyst|Per-vehicle ROI/cost|
|GET|`/api/reports/driver/:id`|Manager, SafetyOfficer|Per-driver performance|
|GET|`/api/reports/export?format=pdf\|csv\|xlsx`|Manager, FinancialAnalyst|File export|

**Standard HTTP status codes used throughout:** `200` OK, `201` Created, `204` No Content (delete), `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `422` Unprocessable Entity, `500` Server Error.

\---

## TASK 10 — Backend Folder Structure

```
server/
├── src/
│   ├── config/          # env loading, db connection, cors, logger setup
│   ├── controllers/     # thin HTTP layer — parse req, call service, shape res
│   ├── services/        # business logic (capacity checks, status transitions)
│   ├── repositories/    # Prisma query wrappers, isolates ORM from services
│   ├── routes/          # express.Router per module, wired to controllers
│   ├── middlewares/     # authenticate, authorize, errorHandler, rateLimiter
│   ├── validators/      # Zod/Joi schemas per endpoint
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── utils/           # jwt helpers, hashing, date utils, cost calculators
│   ├── helpers/         # pagination, response formatters
│   ├── constants/       # enums (TripStatus, VehicleStatus, Roles)
│   └── types/           # shared TS interfaces/DTOs
├── tests/
├── .env
└── server.ts
```

**Responsibility summary:** Controllers never touch Prisma directly; they call a Service, which enforces business rules (e.g., cargo-capacity check) and calls a Repository for persistence. This keeps business logic unit-testable independent of Express or the DB driver.

\---

## TASK 11 — Frontend Folder Structure

```
client/
├── src/
│   ├── pages/            # Dashboard, VehicleRegistry, TripDispatcher, Maintenance,
│   │                      #  FuelExpenses, DriverProfiles, Analytics, Login, Register
│   ├── components/
│   │   ├── common/        # Button, Table, StatusPill, Modal, Drawer, KPICard
│   │   ├── layout/         # Sidebar, TopNav, PageHeader
│   │   └── charts/          # BarChart, DonutChart, TrendLine (wrapping recharts)
│   ├── layouts/            # AppLayout (sidebar+header shell), AuthLayout
│   ├── hooks/               # useVehicles, useTrips, useAuth, useDebounce
│   ├── services/             # axios instances per module (vehicleService.ts, tripService.ts)
│   ├── context/                # AuthContext, ToastContext
│   ├── routes/                  # React Router config + role-guarded routes
│   ├── assets/                   # icons, illustrations
│   ├── utils/                     # formatters (currency, date), capacity validators
│   ├── constants/                  # enums mirrored from backend
│   └── types/                       # TS interfaces (Vehicle, Trip, Driver...)
```

**Responsibility summary:** `services/` isolates all HTTP calls so components never call `axios` directly. `hooks/` wraps React Query (or SWR) around services for caching/invalidation — critical since Vehicle/Driver availability must refresh immediately after a Trip dispatch.

\---

## TASK 12 — Development Roadmap

|Phase|Module|Why This Order|
|-|-|-|
|1|Project scaffolding, DB schema, Prisma migrations|Everything depends on the data model existing first|
|2|Authentication + RBAC middleware|Every subsequent route needs auth guards|
|3|Vehicle Module (CRUD)|No dependencies on other modules; needed before Trips can reference vehicles|
|4|Driver Module (CRUD)|Same — independent, required before Trip assignment|
|5|Trip Module|Depends on Vehicle + Driver existing and their availability queries|
|6|Maintenance Module|Depends on Vehicle existing; introduces the status-lock side effect on Vehicle|
|7|Fuel \& Expense Module|Depends on completed Trips existing|
|8|Dashboard aggregation APIs|Needs all prior modules producing real data to aggregate|
|9|Analytics \& Reports (+ export)|Heaviest dependency — needs Trip, Expense, Maintenance, FuelLog all populated|
|10|Notifications (license/maintenance alerts)|Cross-cutting, layered on top of existing data|
|11|Testing (unit + integration + e2e)|Run continuously per module, hardened before deployment|
|12|Deployment (CI/CD, staging, production)|Final step once feature-complete and tested|

This order minimizes rework: no module is built before the tables/entities it depends on exist, and the highest-complexity module (Analytics) is built last, once real transactional data is flowing through the system to validate against.

\---

## TASK 13 — Risks \& Edge Cases

|Edge Case|Handling Strategy|
|-|-|
|Expired driver license at trip creation|Backend hard-blocks with `403`; frontend disables driver in the select list and shows an inline reason|
|Vehicle under maintenance selected for dispatch|Excluded from the `/api/vehicles?status=available` query entirely; defense-in-depth check repeated in the Trip service layer|
|Duplicate license plate on vehicle creation|DB `UNIQUE` constraint + pre-check in service layer returns `409` with a clear message|
|Overloaded cargo|Client-side real-time warning (as seen in the UI) + authoritative server-side rejection (`422`)|
|Driver already assigned to an active trip|`Driver.status = OnTrip` excludes them from the assignable pool; DB-level check prevents double-booking|
|Trip cancellation after dispatch|Requires a documented reason; reverts Vehicle/Driver to `Available`, does **not** delete the trip record (audit trail)|
|Database failure mid-transaction (e.g., dispatch)|Wrap Vehicle status update + Driver status update + Trip insert in a single Prisma `$transaction` so partial writes never occur|
|Concurrent updates (two dispatchers race the same vehicle)|Optimistic locking via a `version` column, or `SELECT ... FOR UPDATE` inside the transaction; second request receives `409 Conflict`|
|Invalid/expired JWT|`401` with a specific `TOKEN\_EXPIRED` code so the frontend can silently refresh rather than force a full logout|
|Maintenance completed but another open service record exists|Vehicle only reverts to `Available` when zero open Maintenance records remain for it|
|Odometer entered lower than current value on trip completion|Backend validation rejects; likely data-entry error|
|Deleting a vehicle/driver with historical trips|Soft-delete (`isActive = false` / `deletedAt`) rather than hard delete, to preserve referential integrity of past `Trip`/`Expense` records|
|Report export timeout on very large date ranges|Queue the export as a background job (BullMQ) and notify/download when ready, rather than blocking the request|

\---

## TASK 14 — Final Architecture Review \& Recommendations

**Best Practices to enforce from day one:**

* Layered backend (Controller → Service → Repository) — never let a controller call Prisma directly.
* All multi-step, multi-table writes (dispatch, trip completion, maintenance lock/unlock) wrapped in Prisma `$transaction`.
* Centralized enums shared between Prisma schema and frontend `constants/` to avoid drift (e.g., generate a shared types package, or codegen from `schema.prisma`).
* API contracts documented in OpenAPI/Swagger from the start — this SRS's endpoint list becomes the first draft.

**Naming Conventions:** PascalCase for Prisma models/TS interfaces, camelCase for fields/functions, kebab-case for route paths, SCREAMING\_SNAKE\_CASE for enum values and constants.

**Performance Optimizations:**

* Composite indexes on `(vehicleId, status)` and `(driverId, status)` — these are the hottest lookup paths (availability checks run on every trip-creation attempt).
* Cache dashboard KPI aggregation for 30–60 seconds (Redis) rather than recomputing on every load.
* Paginate every list endpoint by default (never return unbounded result sets).

**Security Improvements beyond baseline:**

* Refresh-token rotation with reuse detection.
* Audit log table (`AuditLog`) recording who changed what status and when — important for a compliance-heavy domain like fleet/safety.
* Field-level redaction so a Dispatcher's `GET /api/drivers` response omits sensitive HR fields (complaints, safety score detail) they shouldn't see per the RBAC matrix.

**Future Scalability:**

* The SRS already lists GPS tracking, live maps, mobile app, AI route optimization, multi-tenant support — the schema above is designed so `Organization` and `TripAssignment` (multi-driver) can be added without breaking existing relationships.
* Consider splitting Analytics into its own read-replica-backed service once trip volume grows, since dashboard/report queries are read-heavy and shouldn't compete with transactional writes.

**Missing Features Worth Adding:**

1. **Notification system** — the SRS mentions it as a future enhancement, but license-expiry and maintenance-due alerts are core enough to build into Phase 1 scope, not defer.
2. **Audit trail** on status-changing actions (who dispatched/cancelled/suspended what).
3. **Document storage** for driver license uploads and vehicle insurance documents (referenced in the SRS's "Upload License" function but not represented as a table above — would need a `Document` table + object storage like S3).
4. **Soft-delete pattern** across all entities for data integrity and historical reporting accuracy.

\---

*End of blueprint. This document is a planning artifact — no application code has been generated. Ready to proceed into Phase 1 (scaffolding + schema) on your confirmation.*

