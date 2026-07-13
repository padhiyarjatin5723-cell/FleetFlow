# FleetFlow — Phase 3: API Design & Business Logic
### Complete REST API Architecture Document

**Version:** 1.0
**Phase:** 3 of N — API Design & Business Logic
**Depends on:** Phase 1 (System Architecture & Blueprint) · Phase 2 (Database Design — 13 tables)
**Stack:** React.js · Tailwind CSS · Node.js · Express.js · PostgreSQL · Prisma ORM · JWT · REST

> This document is a planning artifact only. No Express.js implementation code is included. It defines the contract every endpoint must satisfy before backend development begins.

---

## 0. Project Analysis Recap

FleetFlow is a modular fleet & logistics management system replacing manual logbooks. It centralizes vehicle lifecycle, trip dispatching, maintenance, fuel/expense tracking, driver compliance, and financial analytics behind a role-gated REST API.

**Core entities (from Phase 2 database design):** `Role`, `User`, `RefreshToken`, `Vehicle`, `Driver`, `Trip`, `Maintenance`, `FuelLog`, `Expense`, `MonthlyReport`, `Document`, `AuditLog`, `Notification`.

**Roles (RBAC):**
| Role | Scope |
|---|---|
| **Admin** | Full system access, user/role management, audit visibility |
| **Fleet Manager** | Full control of Vehicles, Drivers, Maintenance; view Trips/Expenses; full Reports |
| **Dispatcher** | Full control of Trips; view-only on Vehicles/Drivers/Expenses |
| **Safety Officer** | Full control of Driver compliance & status; view-only elsewhere |
| **Financial Analyst** | Full control of Expenses; full Reports; view-only elsewhere |

**Design conventions used throughout this document** are defined in Section 1 — read it first, since every endpoint below assumes it.

---

## 1. API Design Conventions

### 1.1 Base URL & Versioning
```
https://api.fleetflow.io/api/v1
```
All routes below are relative to this base. Versioning is path-based (`/v1`) to allow non-breaking evolution.

### 1.2 Authentication Scheme
- **Bearer JWT** in the `Authorization` header: `Authorization: Bearer <accessToken>`.
- Access tokens are short-lived (15 min). Refresh tokens (7–30 days, rotating, stored hashed in the `RefreshToken` table) are used to mint new access tokens via `/auth/refresh-token`.
- Endpoints marked **Auth Required: No** are public.

### 1.3 Standard Success Envelope
```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message",
  "meta": { "page": 1, "limit": 20, "totalCount": 142, "totalPages": 8 }
}
```
`meta` is present only on paginated list endpoints.

### 1.4 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [ { "field": "licensePlate", "issue": "Already registered" } ]
  }
}
```

### 1.5 HTTP Status Code Reference (used across all modules)
| Code | Meaning | Typical Trigger |
|---|---|---|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST creating a resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Schema/validation failure |
| 401 | Unauthorized | Missing/expired/invalid JWT |
| 403 | Forbidden | Valid JWT, insufficient role |
| 404 | Not Found | Resource id doesn't exist or is soft-deleted |
| 409 | Conflict | Unique constraint violation, state conflict (e.g., double-booking) |
| 422 | Unprocessable Entity | Business-rule violation (e.g., cargo > capacity) |
| 429 | Too Many Requests | Rate limit exceeded (auth endpoints) |
| 500 | Internal Server Error | Unhandled exception |

### 1.6 Pagination, Filtering, Sorting (applies to every list `GET`)
Query params: `page` (default 1), `limit` (default 20, max 100), `sortBy`, `sortOrder` (`asc`/`desc`), plus module-specific filters documented per endpoint. All list endpoints exclude soft-deleted rows unless `includeDeleted=true` is passed by an Admin.

### 1.7 Soft Delete Policy
Per Phase 2, `Vehicle`, `Driver`, `User`, and `Trip` support soft deletes (`isDeleted`, `deletedAt`). `DELETE` on these resources sets these flags rather than removing rows. `Maintenance`, `FuelLog`, `Expense` are hard-deleted only if never referenced in a locked/exported `MonthlyReport`; otherwise the delete is blocked (409).

### 1.8 Audit Logging
Every state-changing request (`POST`/`PUT`/`PATCH`/`DELETE`) on `Vehicle`, `Driver`, `Trip`, `Maintenance`, `Expense`, and `User` writes an entry to `AuditLog` (polymorphic: entity type, entity id, actor, action, before/after diff, timestamp). This is implicit in every module below and not repeated per endpoint.

### 1.9 Validation Layer
All request bodies are validated against a schema (e.g., Zod/Joi) **before** reaching business logic. Common rules — required fields, string length, enum membership, numeric ranges, date validity — are enforced at this layer; **business rules** (e.g., "vehicle must be Available") are enforced in the service layer and return `422` rather than `400`.

---

## 2. Module 1 — Authentication

#### `POST /auth/login`
- **Purpose:** Authenticate a user and issue access + refresh tokens.
- **Auth Required:** No
- **Roles Allowed:** N/A
- **Request Body:** `{ "email": "string", "password": "string" }`
- **Success (200):** `{ "accessToken", "refreshToken", "user": { "id","name","email","role" } }`
- **Errors:** 400 (missing fields) · 401 (invalid credentials) · 403 (account suspended) · 429 (too many attempts)
- **Backend Validation:** Email format, password non-empty, rate-limit by IP + email.
- **Business Logic:** Verify bcrypt hash; issue JWT with `userId`, `role`, `roleId` claims; persist hashed refresh token with device metadata; write `AuditLog` entry `LOGIN_SUCCESS`.
- **Edge Cases:** Locked/suspended account → 403; unverified email (if enabled) → 403; 5 consecutive failures → temporary lockout (429).

#### `POST /auth/logout`
- **Purpose:** Invalidate the current refresh token (single-device logout).
- **Auth Required:** Yes · **Roles:** Any authenticated user
- **Request Body:** `{ "refreshToken": "string" }`
- **Success (200):** `{ "message": "Logged out" }`
- **Errors:** 401 (invalid/expired token)
- **Business Logic:** Revoke matching `RefreshToken` row; access token remains valid until natural expiry (short TTL mitigates this).
- **Edge Cases:** Logout called twice with same token → idempotent 200.

#### `POST /auth/refresh-token`
- **Purpose:** Exchange a valid refresh token for a new access/refresh pair (rotation).
- **Auth Required:** No (refresh token itself is the credential)
- **Request Body:** `{ "refreshToken": "string" }`
- **Success (200):** `{ "accessToken", "refreshToken" }`
- **Errors:** 401 (expired/revoked/reused token)
- **Business Logic:** Detect refresh-token reuse (rotation family invalidation) → if a revoked token is presented, revoke the entire token family and force re-login (security breach signal).
- **Edge Cases:** Clock skew tolerance of ±60s on expiry checks.

#### `POST /auth/forgot-password`
- **Purpose:** Trigger a password-reset email.
- **Auth Required:** No
- **Request Body:** `{ "email": "string" }`
- **Success (200):** Always `{ "message": "If the email exists, a reset link was sent." }` (no user enumeration)
- **Errors:** 429 (rate limited)
- **Business Logic:** Generate short-lived signed reset token, store hash + expiry, email link.
- **Edge Cases:** Repeated requests within 60s throttled silently.

#### `POST /auth/reset-password`
- **Purpose:** Complete password reset using the emailed token.
- **Auth Required:** No
- **Request Body:** `{ "token": "string", "newPassword": "string" }`
- **Success (200):** `{ "message": "Password updated" }`
- **Errors:** 400 (weak password) · 401 (invalid/expired token)
- **Business Logic:** Verify token, hash new password, invalidate all existing refresh tokens for the user (force re-login everywhere).
- **Edge Cases:** Reused/expired token → 401; token valid but user deleted since issuance → 404.

#### `POST /auth/change-password`
- **Purpose:** Authenticated in-app password change.
- **Auth Required:** Yes · **Roles:** Any
- **Request Body:** `{ "currentPassword", "newPassword" }`
- **Success (200):** `{ "message": "Password changed" }`
- **Errors:** 400 (weak password) · 401 (current password mismatch)
- **Business Logic:** Verify current hash, update, revoke other active sessions (optional, configurable).

#### `GET /auth/me`
- **Purpose:** Return the authenticated user's profile + role + permissions.
- **Auth Required:** Yes · **Roles:** Any
- **Success (200):** `{ "id","name","email","role","permissions":[...] }`
- **Errors:** 401
- **Business Logic:** Resolve `Role` → permission matrix for frontend gating (buttons/menus).

---

## 3. Module 2 — Dashboard

#### `GET /dashboard/summary`
- **Purpose:** KPI cards — Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo (per PDF spec).
- **Auth Required:** Yes · **Roles:** All roles (read-only)
- **Request Params (query):** `vehicleType`, `status`, `region` (optional filters)
- **Success (200):** `{ "activeFleet": 220, "maintenanceAlerts": 18, "utilizationRate": 0.86, "pendingCargo": 20 }`
- **Errors:** 401
- **Business Logic:** Aggregate counts computed live (or from a cached materialized view refreshed every N minutes for performance at 500+ vehicle scale).
- **Edge Cases:** Empty fleet → all zeros, not an error.

#### `GET /dashboard/recent-trips`
- **Purpose:** Recent trips widget/table on the dashboard.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `limit` (default 5), `status`
- **Success (200):** Array of trip summaries (id, vehicle, driver, destination, cargo, status).
- **Errors:** 401
- **Business Logic:** Ordered by `updatedAt desc`.

#### `GET /dashboard/maintenance-alerts`
- **Purpose:** Urgent maintenance widget.
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** Array of `{ vehicleId, licensePlate, issue, priority }` for vehicles currently `In Shop` or overdue.
- **Business Logic:** Filters `Maintenance` rows where `status IN ('In Progress','Overdue')`.

#### `GET /dashboard/license-expiry-alerts`
- **Purpose:** Upcoming/expired driver license widget.
- **Auth Required:** Yes · **Roles:** All (Safety Officer sees full detail; others see summarized counts)
- **Request Params:** `withinDays` (default 30)
- **Success (200):** Array of `{ driverId, name, licenseExpiry, daysRemaining }`.
- **Business Logic:** `licenseExpiry <= today + withinDays`, sorted ascending.

---

## 4. Module 3 — Vehicle Management

#### `GET /vehicles`
- **Purpose:** List/search/filter fleet vehicles (Vehicle Registry).
- **Auth Required:** Yes · **Roles:** All (read); write actions gated per-endpoint below
- **Request Params:** `search` (name/plate), `type`, `status` (`Available|On Trip|In Shop|Out of Service`), `minCapacity`, `maxCapacity`, plus Section 1.6 pagination.
- **Success (200):** Paginated array of vehicle summaries.
- **Errors:** 401
- **Business Logic:** Full-text search on `name` + `licensePlate`; status filter maps directly to `Vehicle.status` enum.

#### `GET /vehicles/:id`
- **Purpose:** Full vehicle detail (specs, health, upcoming service).
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** Vehicle object incl. computed `totalOperationalCost` (Fuel + Maintenance, per PDF).
- **Errors:** 401 · 404 (not found or soft-deleted)

#### `POST /vehicles`
- **Purpose:** Register a new vehicle.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Request Body:** `{ name, licensePlate, manufacturer, model, year, vehicleType, fuelType, maxLoadCapacityKg, initialOdometer, registrationDate, insuranceExpiry, color, notes }`
- **Success (201):** Created vehicle object, `status` defaulted to `Available`.
- **Errors:** 400 (schema) · 401 · 403 (wrong role) · 409 (duplicate `licensePlate`)
- **Backend Validation:** `licensePlate` unique, `maxLoadCapacityKg` > 0, `year` within reasonable range, `insuranceExpiry` in the future.
- **Business Logic:** Persist with UUID PK; write `AuditLog` `VEHICLE_CREATED`.
- **Edge Cases:** Duplicate plate re-submission (double-click) → 409, not a silent 201.

#### `PUT /vehicles/:id`
- **Purpose:** Edit vehicle master data (not status — see below).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Request Body:** Same shape as create, partial allowed.
- **Success (200):** Updated vehicle object.
- **Errors:** 400 · 401 · 403 · 404 · 409 (plate collision with another record)
- **Business Logic:** Blocks editing `licensePlate` if the vehicle has an active (`Dispatched`) trip, to preserve audit integrity — returns 409.

#### `PATCH /vehicles/:id/status`
- **Purpose:** Manual status toggle, primarily "Out of Service" / "Retired" (per PDF: manual toggle for retirement) and reactivation.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Request Body:** `{ "status": "Available|Out of Service" }`
- **Success (200):** `{ id, status }`
- **Errors:** 401 · 403 · 404 · 422 (illegal transition, e.g., cannot manually set `On Trip` or `In Shop` — those are system-derived)
- **Business Logic:** `On Trip` is set only by Trip dispatch; `In Shop` is set only by Maintenance creation (Rule: Maintenance → auto-lock, see Section 10). This endpoint only permits the manager-controlled transitions `Available ⇄ Out of Service`.
- **Edge Cases:** Attempt to retire a vehicle with an active trip → 422 with explanatory message.

#### `DELETE /vehicles/:id`
- **Purpose:** Soft-delete a vehicle record.
- **Auth Required:** Yes · **Roles:** Admin only
- **Success (204):** No content.
- **Errors:** 401 · 403 · 404 · 409 (has trip/maintenance/expense history referenced in a locked report — deletion blocked, deactivate instead)
- **Business Logic:** Sets `isDeleted=true`, `deletedAt=now()`; excluded from all future list/dashboard queries.

#### `GET /vehicles/:id/history`
- **Purpose:** Combined trip + maintenance + fuel/expense timeline for one vehicle.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `type` filter (`trip|maintenance|expense|all`), pagination.
- **Success (200):** Chronological array of history events.
- **Errors:** 401 · 404

---

## 5. Module 4 — Driver Management

#### `GET /drivers`
- **Purpose:** List/search/filter driver profiles.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `search` (name/ID/license#), `status` (`On Duty|Off Duty|Suspended`), `licenseExpiring` (bool), pagination.
- **Success (200):** Paginated array with safety score, trip completion %, complaint count.

#### `GET /drivers/:id`
- **Purpose:** Full driver profile.
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** Driver object incl. license validity flag, safety score, current status.
- **Errors:** 401 · 404

#### `POST /drivers`
- **Purpose:** Onboard a new driver.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Safety Officer, Admin
- **Request Body:** `{ name, contact, licenseNumber, licenseExpiry, vehicleCategory, experienceYears }`
- **Success (201):** Created driver, `status` defaulted to `Off Duty`, `safetyScore` defaulted to a neutral baseline.
- **Errors:** 400 · 401 · 403 · 409 (duplicate `licenseNumber`)
- **Backend Validation:** `licenseExpiry` must be a future date at creation; `contact` format validated.

#### `PUT /drivers/:id`
- **Purpose:** Edit driver profile fields.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Safety Officer, Admin
- **Success (200):** Updated driver object.
- **Errors:** 400 · 401 · 403 · 404 · 409

#### `PATCH /drivers/:id/status`
- **Purpose:** Toggle On Duty / Off Duty / Suspended.
- **Auth Required:** Yes · **Roles:** Safety Officer, Fleet Manager, Admin (Suspension specifically: Safety Officer, Admin)
- **Request Body:** `{ "status": "On Duty|Off Duty|Suspended", "reason": "string (required if Suspended)" }`
- **Success (200):** `{ id, status }`
- **Errors:** 401 · 403 · 404 · 422 (cannot set `On Duty` if license expired, or driver is currently assigned to an active trip and being suspended without trip reassignment)
- **Business Logic:** Setting `Suspended` while the driver has a `Dispatched` trip triggers a `Notification` to Dispatcher for reassignment; does not auto-cancel the trip.

#### `POST /drivers/:id/license-document`
- **Purpose:** Upload license scan (polymorphic `Document` table).
- **Auth Required:** Yes · **Roles:** Safety Officer, Fleet Manager, Admin
- **Request Body:** multipart file + `{ documentType: "License" }`
- **Success (201):** `{ documentId, url, uploadedAt }`
- **Errors:** 400 (invalid file type/size) · 401 · 403 · 404 (driver not found)
- **Business Logic:** Stores file in object storage, persists `Document` row polymorphically linked to `Driver`.

#### `DELETE /drivers/:id`
- **Purpose:** Soft-delete/offboard a driver.
- **Auth Required:** Yes · **Roles:** Admin only
- **Success (204):** No content.
- **Errors:** 401 · 403 · 404 · 409 (driver has an active `Dispatched` trip — must complete/reassign first)

#### `GET /drivers/:id/trips`
- **Purpose:** Driver's trip history (for performance/safety score derivation).
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** pagination, `status`
- **Success (200):** Paginated trip array.
- **Errors:** 401 · 404

---

## 6. Module 5 — Trip Management

#### `GET /trips`
- **Purpose:** List/search/filter trips (Trip Dispatcher table).
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `search`, `status` (`Draft|Dispatched|Completed|Cancelled`), `vehicleId`, `driverId`, `dateFrom`, `dateTo`, pagination.
- **Success (200):** Paginated trip array.

#### `GET /trips/:id`
- **Purpose:** Full trip detail.
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** Trip object incl. vehicle/driver snapshot, cargo weight, route, cost estimate.
- **Errors:** 401 · 404

#### `POST /trips`
- **Purpose:** Create a trip (Draft or immediate Dispatch).
- **Auth Required:** Yes · **Roles:** Dispatcher, Fleet Manager, Admin
- **Request Body:** `{ vehicleId, driverId, originAddress, destinationAddress, cargoWeightKg, tripDate, dispatchTime, notes, saveAsDraft: boolean }`
- **Success (201):** Created trip object with `status: "Draft"` or `"Dispatched"`.
- **Errors:** 400 · 401 · 403 · 404 (vehicle/driver not found) · 422 (business-rule violation, see below) · 409 (vehicle or driver already committed to another active trip)
- **Backend Validation:** All ids exist; `cargoWeightKg` > 0; `tripDate` not in the past for dispatch.
- **Business Logic (Rules 1–4 from SRS):**
  1. Vehicle status must be `Available`.
  2. Driver status must be `On Duty`/`Available` (not `Suspended`, not already on another trip).
  3. Driver's license must not be expired, and must cover the vehicle's `vehicleCategory`.
  4. `cargoWeightKg` ≤ `vehicle.maxLoadCapacityKg` — **hard validation rule**, returns 422 with the exact overage if violated (matches PDF's "Prevent trip creation if CargoWeight > MaxCapacity").
  - On successful **Dispatch** (not Draft): atomically sets `Vehicle.status = 'On Trip'` and `Driver.status = 'On Trip'` within a DB transaction to avoid race conditions on concurrent dispatch requests.
- **Edge Cases:** Two dispatchers submit the same vehicle simultaneously → row-level lock/transaction ensures only one succeeds, the other gets 409; Draft trips do **not** lock the vehicle/driver.

#### `PUT /trips/:id`
- **Purpose:** Edit a trip while still in `Draft`.
- **Auth Required:** Yes · **Roles:** Dispatcher, Fleet Manager, Admin
- **Success (200):** Updated trip.
- **Errors:** 400 · 401 · 403 · 404 · 409 (trip is no longer `Draft` — must use status-specific endpoints instead) · 422 (same validations as create)

#### `PATCH /trips/:id/status`
- **Purpose:** Generic lifecycle transition (`Draft → Dispatched`, or manual override by Manager).
- **Auth Required:** Yes · **Roles:** Dispatcher, Fleet Manager, Admin
- **Request Body:** `{ "status": "Dispatched" }`
- **Success (200):** `{ id, status }`
- **Errors:** 401 · 403 · 404 · 422 (invalid transition — only `Draft→Dispatched` and `Draft→Cancelled` are allowed via this endpoint; `Completed`/`Cancelled`-from-`Dispatched` use dedicated endpoints below for their side effects)
- **Business Logic:** Re-runs the four dispatch validations from `POST /trips` at transition time (state may have changed since Draft creation, e.g., driver license expired in the interim).

#### `POST /trips/:id/complete`
- **Purpose:** Mark a dispatched trip complete (driver returns, per PDF workflow).
- **Auth Required:** Yes · **Roles:** Dispatcher, Fleet Manager, Admin
- **Request Body:** `{ "finalOdometer": number, "actualArrival": "ISO8601" }`
- **Success (200):** Trip with `status: "Completed"`.
- **Errors:** 401 · 403 · 404 · 409 (trip not in `Dispatched` state) · 422 (`finalOdometer` < vehicle's current odometer)
- **Business Logic:** Transaction: `Vehicle.status → 'Available'`, `Vehicle.odometer = finalOdometer`, `Driver.status → 'Available'`, trip `status → 'Completed'`, `arrivedAt` timestamp set. Triggers Rule 8 (fuel efficiency recalculation) once the associated `FuelLog` is entered.
- **Edge Cases:** Completing a trip whose vehicle was concurrently moved to `In Shop` by a Maintenance creation → still allowed (trip completion always resolves the vehicle back to `Available` unless an open Maintenance record exists, in which case vehicle resolves to `In Shop` instead — see Section 10 Vehicle Lifecycle).

#### `POST /trips/:id/cancel`
- **Purpose:** Cancel a Draft or Dispatched trip.
- **Auth Required:** Yes · **Roles:** Dispatcher, Fleet Manager, Admin
- **Request Body:** `{ "reason": "string" }`
- **Success (200):** Trip with `status: "Cancelled"`.
- **Errors:** 401 · 403 · 404 · 409 (already `Completed`/`Cancelled`)
- **Business Logic:** If trip was `Dispatched`, releases the vehicle (`→ Available`, unless it has an open Maintenance record → `In Shop`) and driver (`→ Available`, unless `Suspended`).

#### `DELETE /trips/:id`
- **Purpose:** Hard-delete a trip — permitted only while still `Draft` (never-dispatched, no financial/audit weight).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Success (204):** No content.
- **Errors:** 401 · 403 · 404 · 409 (not in `Draft` status — must be cancelled instead, per audit-trail integrity)

---

## 7. Module 6 — Maintenance

#### `GET /maintenance`
- **Purpose:** List/search/filter service logs.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `search`, `vehicleId`, `serviceType`, `status` (`Scheduled|In Progress|Awaiting Parts|Completed`), `priority`, `dateFrom`, `dateTo`, pagination.
- **Success (200):** Paginated array.

#### `GET /maintenance/:id`
- **Purpose:** Full service log detail.
- **Auth Required:** Yes · **Roles:** All
- **Errors:** 401 · 404

#### `POST /maintenance`
- **Purpose:** Log new maintenance/service activity.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Request Body:** `{ vehicleId, serviceType, priority, issueDescription, serviceDate, estCompletionDate, technician, workshop, estCost, status }`
- **Success (201):** Created maintenance record.
- **Errors:** 400 · 401 · 403 · 404 (vehicle not found) · 409 (vehicle already has an open maintenance record)
- **Business Logic (Rule 5 / PDF "Logic Link"):** On creation with `status IN ('Scheduled','In Progress','Awaiting Parts')`, atomically sets `Vehicle.status = 'In Shop'`, which **removes the vehicle from the Trip Dispatcher's selection pool** immediately (enforced at the `POST /trips` validation layer, not just the UI).
- **Edge Cases:** Attempting to create maintenance for a vehicle currently `On Trip` → 409 (must wait for trip completion) unless `priority = 'Critical'`, in which case Fleet Manager may force-create (flagged in `AuditLog` as an override) and the vehicle is locked upon its next completion.

#### `PUT /maintenance/:id`
- **Purpose:** Edit a maintenance record (cost, technician, notes, dates).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Errors:** 400 · 401 · 403 · 404 · 409 (already `Completed` — immutable except for `notes`)

#### `PATCH /maintenance/:id/complete`
- **Purpose:** Close out a service record.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin
- **Request Body:** `{ "actualCost": number, "completedAt": "ISO8601", "notes": "string" }`
- **Success (200):** Maintenance with `status: "Completed"`.
- **Errors:** 401 · 403 · 404 · 409 (not currently open)
- **Business Logic:** Releases the vehicle: `Vehicle.status → 'Available'` **unless** another open Maintenance record exists for the same vehicle (multiple concurrent service tickets), in which case it remains `In Shop`. Also feeds `Expense`/`MonthlyReport` cost aggregation (Rule: Total Operational Cost = Fuel + Maintenance).

#### `DELETE /maintenance/:id`
- **Purpose:** Remove an erroneous maintenance record.
- **Auth Required:** Yes · **Roles:** Admin only
- **Success (204):** No content.
- **Errors:** 401 · 403 · 404 · 409 (already reflected in a locked/exported `MonthlyReport`)
- **Business Logic:** If the record was currently holding the vehicle `In Shop`, deletion re-evaluates and releases the vehicle if no other open record exists.

---

## 8. Module 7 — Fuel Logs

#### `GET /fuel-logs`
- **Purpose:** List/filter fuel entries.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `vehicleId`, `tripId`, `dateFrom`, `dateTo`, pagination.
- **Success (200):** Paginated array.

#### `GET /fuel-logs/:id`
- **Auth Required:** Yes · **Roles:** All
- **Errors:** 401 · 404

#### `POST /fuel-logs`
- **Purpose:** Record fuel purchase/consumption for a completed (or in-progress) trip.
- **Auth Required:** Yes · **Roles:** Financial Analyst, Fleet Manager, Dispatcher, Admin
- **Request Body:** `{ vehicleId, tripId (nullable), liters, cost, date, notes }`
- **Success (201):** Created fuel log.
- **Errors:** 400 · 401 · 403 · 404 (vehicle/trip not found) · 422 (`liters` or `cost` ≤ 0)
- **Business Logic (Rule 8):** After insert, recalculates the linked trip's/vehicle's fuel efficiency (`km/L = distance / liters`) and updates the cached analytics figure consumed by `GET /analytics/fuel-efficiency`.

#### `PUT /fuel-logs/:id`
- **Auth Required:** Yes · **Roles:** Financial Analyst, Fleet Manager, Admin
- **Errors:** 400 · 401 · 403 · 404 · 409 (already included in a locked `MonthlyReport`)

#### `DELETE /fuel-logs/:id`
- **Auth Required:** Yes · **Roles:** Admin only
- **Success (204)** · **Errors:** 401 · 403 · 404 · 409 (locked report)

---

## 9. Module 8 — Expense Management

#### `GET /expenses`
- **Purpose:** List/filter miscellaneous + fuel-adjacent expenses (Expense & Fuel Logging page).
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `search` (trip ID/driver), `category` (`Fuel|Repair|Toll|Parking|Food|Other`), `status`, `vehicleId`, `dateFrom`, `dateTo`, pagination.
- **Success (200):** Paginated array.

#### `GET /expenses/:id`
- **Auth Required:** Yes · **Roles:** All
- **Errors:** 401 · 404

#### `POST /expenses`
- **Purpose:** Log a non-fuel operational expense (or fuel expense captured outside `fuel-logs`).
- **Auth Required:** Yes · **Roles:** Financial Analyst, Fleet Manager, Admin
- **Request Body:** `{ tripId (nullable), vehicleId, category, amount, date, notes }`
- **Success (201):** Created expense.
- **Errors:** 400 · 401 · 403 · 404 · 422 (`amount` ≤ 0)
- **Business Logic:** `tripId` is optional (per SRS relationship note: "Expenses may optionally be linked to a specific Trip"); when present, must belong to a `Completed` trip.

#### `PUT /expenses/:id`
- **Auth Required:** Yes · **Roles:** Financial Analyst, Fleet Manager, Admin
- **Errors:** 400 · 401 · 403 · 404 · 409 (locked report)

#### `DELETE /expenses/:id`
- **Auth Required:** Yes · **Roles:** Admin only
- **Success (204)** · **Errors:** 401 · 403 · 404 · 409 (locked report)

#### `GET /expenses/vehicle/:vehicleId/total-cost`
- **Purpose:** Automated "Total Operational Cost" per PDF (Fuel + Maintenance) for one vehicle.
- **Auth Required:** Yes · **Roles:** All
- **Request Params:** `dateFrom`, `dateTo` (optional window; default = all-time)
- **Success (200):** `{ vehicleId, fuelCost, maintenanceCost, miscExpenseCost, totalCost }`
- **Errors:** 401 · 404
- **Business Logic:** `totalCost = SUM(FuelLog.cost) + SUM(Maintenance.actualCost) + SUM(Expense.amount)` scoped to the vehicle and date window.

---

## 10. Module 9 — Reports

#### `GET /reports/monthly`
- **Purpose:** Fetch/generate the denormalized `MonthlyReport` (Phase 2 design decision: deliberately denormalized for analytics performance).
- **Auth Required:** Yes · **Roles:** Fleet Manager (full), Financial Analyst (full), Dispatcher/Safety Officer (limited fields per RBAC matrix)
- **Request Params:** `month` (YYYY-MM), `regenerate` (bool, Admin/Manager only)
- **Success (200):** `{ month, revenue, fuelCost, maintenanceCost, netProfit, generatedAt, locked }`
- **Errors:** 401 · 403 · 404 (month not yet generated and `regenerate` not requested)
- **Business Logic:** If not cached, computes and persists a `MonthlyReport` row; once persisted, the month is `locked` (Section 1.7) to preserve historical audit accuracy — regeneration by Admin explicitly re-locks with a new `generatedAt`.

#### `GET /reports/vehicle/:id`
- **Purpose:** Per-vehicle report (cost breakdown, utilization, trip count).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Errors:** 401 · 403 · 404

#### `GET /reports/driver/:id`
- **Purpose:** Per-driver report (completion rate, safety score trend, complaints).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Safety Officer, Admin
- **Errors:** 401 · 403 · 404

#### `GET /reports/expenses`
- **Purpose:** Expense breakdown report by category/date range.
- **Auth Required:** Yes · **Roles:** Financial Analyst, Fleet Manager, Admin
- **Request Params:** `dateFrom`, `dateTo`, `groupBy` (`category|vehicle|month`)
- **Errors:** 401 · 403

#### `GET /reports/maintenance`
- **Purpose:** Maintenance cost/frequency report.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Errors:** 401 · 403

#### `GET /reports/export`
- **Purpose:** One-click CSV/PDF export (per PDF spec: "for monthly payroll and health audits").
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Request Params:** `reportType` (`monthly|vehicle|driver|expense|maintenance`), `format` (`pdf|csv`), plus the relevant report's own filters.
- **Success (200):** Binary file stream with appropriate `Content-Type` / `Content-Disposition`.
- **Errors:** 400 (unsupported format) · 401 · 403 · 404
- **Business Logic:** Reuses the same query/service layer as the corresponding `GET /reports/*` endpoint, then pipes through a PDF/CSV renderer.

---

## 11. Module 10 — Analytics

#### `GET /analytics/cost-per-km`
- **Purpose:** Rule 7/8-derived metric — operational cost normalized by distance.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Request Params:** `vehicleId` (optional, else fleet-wide), `dateFrom`, `dateTo`
- **Success (200):** `{ costPerKm, sampleSize }`

#### `GET /analytics/fuel-efficiency`
- **Purpose:** km/L trend, per PDF metric.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Request Params:** `vehicleId`, `period` (`weekly|monthly`)
- **Success (200):** Time series array `[{ period, kmPerLiter }]`
- **Business Logic:** Recomputed incrementally whenever a `FuelLog` is created for a completed trip (Rule 8).

#### `GET /analytics/vehicle-utilization`
- **Purpose:** % of fleet assigned vs. idle (dashboard KPI's underlying detail).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Admin, Dispatcher
- **Success (200):** `{ available, onTrip, inShop, outOfService, utilizationRate }`

#### `GET /analytics/driver-performance`
- **Purpose:** Trip completion rate + safety score aggregate.
- **Auth Required:** Yes · **Roles:** Fleet Manager, Safety Officer, Admin
- **Request Params:** `driverId` (optional), pagination for fleet-wide leaderboard.
- **Success (200):** Array of `{ driverId, name, completionRate, safetyScore, complaints }`

#### `GET /analytics/roi`
- **Purpose:** Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost (per PDF formula).
- **Auth Required:** Yes · **Roles:** Fleet Manager, Financial Analyst, Admin
- **Request Params:** `vehicleId` (optional), `dateFrom`, `dateTo`
- **Success (200):** `{ vehicleId, revenue, maintenanceCost, fuelCost, acquisitionCost, roi }`
- **Errors:** 422 (`acquisitionCost` not set on vehicle — cannot compute ROI, returns explanatory message rather than dividing by zero/null)

---

## 12. Module 11 — Notifications

#### `GET /notifications`
- **Purpose:** In-app notification feed (license expiry, maintenance overdue, driver suspension conflicts, etc.).
- **Auth Required:** Yes · **Roles:** All (scoped to the authenticated user/role)
- **Request Params:** `unreadOnly` (bool), pagination.
- **Success (200):** Paginated array `{ id, type, message, isRead, createdAt, relatedEntity }`

#### `PATCH /notifications/:id/read`
- **Purpose:** Mark one notification read.
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** `{ id, isRead: true }`
- **Errors:** 401 · 404 (not found or not owned by requester)

#### `PATCH /notifications/read-all`
- **Purpose:** Bulk mark-all-read.
- **Auth Required:** Yes · **Roles:** All
- **Success (200):** `{ updatedCount }`

#### `DELETE /notifications/:id`
- **Purpose:** Dismiss/delete a notification.
- **Auth Required:** Yes · **Roles:** All
- **Success (204)** · **Errors:** 401 · 404

---

## 13. Consolidated Business Rules

| # | Rule | Enforced In |
|---|---|---|
| 1 | Vehicle must have `status = Available` to be dispatched on a trip. | `POST /trips`, `PATCH /trips/:id/status` |
| 2 | Driver must have `status = Available`/`On Duty` (not `Suspended`, not already on a trip) to be assigned. | `POST /trips`, `PATCH /trips/:id/status` |
| 3 | Driver's license must be valid (not expired) and must match the vehicle's category. | `POST /trips`, `PATCH /drivers/:id/status` |
| 4 | Cargo weight must be ≤ vehicle's max load capacity. | `POST /trips` |
| 5 | Creating an open Maintenance record locks the vehicle (`status = In Shop`), removing it from trip-assignment eligibility until the record is completed. | `POST /maintenance`, `PATCH /maintenance/:id/complete` |
| 6 | Trip lifecycle is strictly `Draft → Dispatched → Completed`, or `Draft/Dispatched → Cancelled`. No other transitions are permitted. | `PATCH /trips/:id/status`, `/complete`, `/cancel` |
| 7 | Vehicle utilization is derived, never manually set (`On Trip`/`In Shop` are system-controlled; only `Available ⇄ Out of Service` is manager-controlled). | `PATCH /vehicles/:id/status` |
| 8 | Fuel efficiency (km/L) is recalculated automatically after every completed trip's fuel log entry. | `POST /fuel-logs` |
| 9 | Total Operational Cost per vehicle = Fuel + Maintenance (+ Misc Expenses). | `GET /expenses/vehicle/:id/total-cost` |
| 10 | `MonthlyReport` rows are locked once generated; only Admin can force-regenerate. | `GET /reports/monthly` |
| 11 | Financial records (`FuelLog`, `Expense`, `Maintenance`) referenced by a locked `MonthlyReport` cannot be edited/deleted — only Admin hard-deletes, and even then it's blocked (409) if locked. | `PUT`/`DELETE` on Fuel Logs, Expenses, Maintenance |
| 12 | Soft-deleted `Vehicle`/`Driver`/`Trip`/`User` records are excluded from all reads unless `includeDeleted=true` is passed by an Admin. | All list `GET` endpoints |
| 13 | Every state-changing action is written to `AuditLog` with actor, entity, before/after diff. | All `POST`/`PUT`/`PATCH`/`DELETE` |
| 14 | Refresh-token reuse (a revoked token presented again) revokes the entire token family and forces re-authentication. | `POST /auth/refresh-token` |
| 15 | Password reset invalidates all existing sessions for that user. | `POST /auth/reset-password` |
| 16 | Suspending a driver who is currently on a `Dispatched` trip does not auto-cancel the trip; it raises a `Notification` for Dispatcher action. | `PATCH /drivers/:id/status` |
| 17 | A vehicle can only be manually retired (`Out of Service`) if it has no active `Dispatched` trip. | `PATCH /vehicles/:id/status` |
| 18 | Trips can only be hard-deleted while in `Draft` status; dispatched/completed/cancelled trips are preserved for audit and must instead be cancelled. | `DELETE /trips/:id` |

---

## 14. Authentication Flow

```
1. Client → POST /auth/login (email, password)
2. Server verifies bcrypt hash
3. Server issues:
     - accessToken  (JWT, 15 min TTL, claims: userId, role, roleId)
     - refreshToken (opaque, rotating, 7–30 day TTL, hashed at rest)
4. Client stores accessToken in memory, refreshToken in httpOnly secure cookie (or secure storage on mobile)
5. Client attaches "Authorization: Bearer <accessToken>" to every subsequent request
6. On 401 (expired access token):
     Client → POST /auth/refresh-token (refreshToken)
     Server validates, rotates token, issues new pair
     Client retries the original request
7. On refresh-token expiry/reuse-detection → force full re-login
8. Client → POST /auth/logout on sign-out → server revokes the specific refresh token
```

---

## 15. Authorization (RBAC) Flow

```
1. JWT payload carries "role" (denormalized at issuance for speed) and "roleId" (FK to Role table)
2. Every protected route is wrapped by two middlewares, in order:
     a. authenticate  → verifies JWT signature + expiry, attaches req.user
     b. authorize([roles]) → checks req.user.role against the endpoint's allowed-roles list (Sections 2–12)
3. Failure modes:
     - No/invalid token           → 401
     - Valid token, wrong role    → 403
4. Fine-grained field-level restrictions (e.g., Financial Analyst sees cost fields, Dispatcher does not)
   are applied at the serialization layer AFTER authorization passes — same endpoint, role-shaped response.
5. Role permissions are sourced from the `Role` table (Phase 2), not hardcoded, so an Admin can extend
   the permission matrix without a code deploy — the authorize() middleware reads the current matrix at
   request time (cached, short TTL).
```

**RBAC Matrix (from SRS, authoritative):**

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Vehicles | Full | View | View | View |
| Drivers | Full | View | Full | View |
| Trips | View | Full | View | View |
| Maintenance | Full | View | View | View |
| Expenses | View | View | View | Full |
| Reports | Full | Limited | Limited | Full |

(Admin is a superset of all of the above and is omitted from the SRS table but implied by system administration needs — see `Role`/`User` design in Phase 2.)

---

## 16. Validation Flow

```
Request
  │
  ▼
[1] Schema Validation (Zod/Joi middleware)
    - Required fields present
    - Types correct, string lengths bounded
    - Enum values valid (status, category, vehicleType, etc.)
    - Fails → 400 VALIDATION_ERROR, per-field details
  │
  ▼
[2] Authentication Middleware
    - JWT valid & unexpired → attaches req.user
    - Fails → 401 UNAUTHORIZED
  │
  ▼
[3] Authorization Middleware
    - req.user.role permitted for this route
    - Fails → 403 FORBIDDEN
  │
  ▼
[4] Referential Integrity Checks (service layer)
    - Referenced IDs (vehicleId, driverId, tripId) exist and are not soft-deleted
    - Fails → 404 NOT_FOUND
  │
  ▼
[5] Business Rule Validation (service layer, Section 13 rules)
    - Cargo ≤ capacity, license valid, no double-booking, lifecycle transition legal, etc.
    - Fails → 422 UNPROCESSABLE_ENTITY (or 409 CONFLICT for concurrency/uniqueness clashes)
  │
  ▼
[6] Persist (transactional where multiple entities change together, e.g., trip dispatch)
  │
  ▼
[7] Audit Log write (async, non-blocking)
  │
  ▼
Response (Section 1.3 envelope)
```

---

## 17. Trip Lifecycle

```
                 ┌────────┐
   create        │ Draft  │  (vehicle/driver NOT locked)
   (save draft) →│        │
                 └───┬────┘
                     │ dispatch (re-validates Rules 1–4)
                     ▼
               ┌──────────────┐
               │  Dispatched  │  (Vehicle→On Trip, Driver→On Trip)
               └──────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │ complete                     │ cancel
        ▼                              ▼
 ┌─────────────┐                ┌───────────┐
 │  Completed  │                │ Cancelled │
 │ (Vehicle→   │                │ (Vehicle/ │
 │  Available* │                │  Driver → │
 │  Driver →   │                │  released)│
 │  Available) │                └───────────┘
 └─────────────┘

 * Available unless an open Maintenance record exists → In Shop instead.

Also: Draft → Cancelled is a valid direct transition (trip abandoned before dispatch).
Draft is the ONLY status from which a trip can be hard-deleted (DELETE /trips/:id).
```

---

## 18. Vehicle Lifecycle

```
        register (POST /vehicles)
                │
                ▼
         ┌─────────────┐
    ┌───▶│  Available  │◀───┐
    │    └──────┬──────┘    │
    │           │            │
    │  trip dispatched       │ maintenance completed
    │           ▼            │ (and no other open record)
    │    ┌─────────────┐     │
    │    │   On Trip   │     │
    │    └──────┬──────┘     │
    │           │ trip completed/cancelled
    │           └────────────┘
    │
    │  maintenance created (Rule 5)
    │           ▼
    │    ┌─────────────┐
    └────│   In Shop   │  (removed from Trip Dispatcher pool)
         └─────────────┘

  Manager-only side transition (any state where no active trip exists):
         Available ⇄ Out of Service   (PATCH /vehicles/:id/status)

  Terminal (Admin only):  any state → soft-deleted (DELETE /vehicles/:id),
  blocked (409) if an active trip or open maintenance record exists.
```

---

## 19. Driver Lifecycle

```
        onboard (POST /drivers)
                │
                ▼
         ┌─────────────┐
         │  Off Duty   │◀────────────┐
         └──────┬──────┘             │
                │ shift start        │ shift end /
                ▼                    │ trip completed
         ┌─────────────┐             │
         │  On Duty /  │─────────────┘
         │  Available  │
         └──────┬──────┘
                │ assigned to a Dispatched trip
                ▼
         ┌─────────────┐
         │  On Trip    │──── trip completes/cancels ───▶ back to On Duty/Available
         └─────────────┘

  From ANY state (Safety Officer / Fleet Manager / Admin):
         → Suspended  (reason required; if on an active trip, Notification raised
                        for Dispatcher, trip is NOT auto-cancelled)

  Reactivation from Suspended requires:
         - license re-verified as valid (not expired)
         - explicit Safety Officer/Admin action (PATCH /drivers/:id/status)

  Terminal (Admin only): soft-deleted (DELETE /drivers/:id),
  blocked (409) if driver has an active Dispatched trip.
```

---

## 20. Cross-Module Consistency Notes (for the implementation phase)

- All monetary fields are stored as integers in the smallest currency unit (paise/cents) at the database layer and formatted at the API boundary — prevents floating-point drift in `MonthlyReport` aggregation.
- All timestamps are UTC ISO 8601 in transit; the frontend (per `DESIGN.md`) is responsible for locale formatting.
- Every list endpoint's `meta.totalCount` must be computed from the same filtered query as the data rows (avoid N+1 count mismatches under concurrent writes).
- Trip dispatch, trip completion, and maintenance creation/completion are the four transaction boundaries in the entire system where **two entities change state together** — these are the only places requiring explicit DB transactions with row-level locking to satisfy Rules 1, 2, 5, and 7 under concurrent access.

---

*End of Phase 3 — API Design & Business Logic document. Ready for Phase 4 (implementation planning / controller-service scaffolding) upon your instruction.*
