# FleetFlow — Phase 1: Project & Screen Analysis
### Prepared by: Senior Software Architect / Technical Lead Review

---

# TASK 1 — Project Understanding

### Project Objective
Replace informal, error-prone manual fleet logbooks with a centralized, rule-enforcing digital platform that manages the complete lifecycle of a delivery fleet — vehicle assets, driver compliance, trip dispatching, maintenance, fuel/expense tracking, and financial/operational analytics — in one connected system.

### Problem Statement
Logistics operators currently track vehicles, drivers, trips, and costs across disconnected spreadsheets, paper logs, or siloed tools. This causes:
- No real-time visibility into which vehicles/drivers are actually available.
- Cargo overloading due to no automated capacity checks against a vehicle's rated max load.
- Drivers dispatched with expired licenses because expiry isn't cross-checked at assignment time.
- Maintenance being tracked separately from dispatch, so a vehicle in the shop can still get accidentally assigned.
- Financial performance (fuel cost, maintenance cost, ROI per vehicle) computed manually and after the fact, rather than in real time.

### Business Goals
1. Digitize the entire fleet operations lifecycle into a single source of truth.
2. Enforce business rules automatically (capacity, license validity, availability) instead of relying on manual diligence.
3. Reduce vehicle downtime by proactively surfacing maintenance needs.
4. Improve driver safety and accountability via measurable safety scores and compliance tracking.
5. Give financial stakeholders real-time cost and ROI visibility per vehicle, per month.
6. Produce audit-ready exports (PDF/CSV) for payroll, compliance, and financial review.

### Target Users
| Role | Primary Concern |
|---|---|
| Fleet Manager | Vehicle lifecycle, scheduling, overall fleet oversight, approvals |
| Dispatcher | Creating trips, assigning available vehicles/drivers, validating loads |
| Safety Officer | Driver license compliance, safety scores, suspensions |
| Financial Analyst | Fuel spend, maintenance ROI, cost audits, financial reporting |

### User Roles (summary of authority)
- **Fleet Manager** — highest operational authority; full control over vehicles, maintenance, and driver records; read access to trips/expenses; approval authority.
- **Dispatcher** — full control over trip creation and lifecycle; read-only elsewhere.
- **Safety Officer** — full control over driver compliance/status; read-only elsewhere.
- **Financial Analyst** — full control over expenses/reports; read-only elsewhere.

### Overall Workflow
```
Login → Dashboard → Vehicle & Driver Registration → Trip Creation
   → Validation (Availability + License + Capacity) → Dispatch
   → Trip Completion (odometer + fuel log) → Expense Logging
   → Maintenance (interrupts availability when triggered)
   → Analytics & Reports updated continuously
```

### Core Features
- Role-based secure authentication.
- Real-time fleet KPI dashboard.
- Vehicle asset registry with lifecycle status (Available / On Trip / In Shop / Out of Service).
- Driver registry with license compliance and safety scoring.
- Trip dispatch workflow with automated capacity and eligibility validation.
- Maintenance/service log with automatic vehicle-locking business logic.
- Fuel and expense logging tied to completed trips.
- Financial and operational analytics with exportable reports.

### Functional Modules
Authentication · Dashboard · Vehicle Management · Driver Management · Trip Management · Maintenance Management · Fuel & Expense Management · Reports & Analytics · (Role Management as a cross-cutting concern).

### Business Rules (system-wide)
1. `CargoWeight ≤ Vehicle.MaxCapacity` — enforced at trip creation, both client and server.
2. A vehicle with an open Maintenance record cannot be dispatched — its status is forced to `In Shop`.
3. A driver with an expired license, or a `Suspended` status, cannot be assigned to a trip.
4. Dispatching a trip sets both `Vehicle.status` and `Driver.status` to `On Trip`; completing it reverts both to `Available`.
5. Total Operational Cost (per vehicle) = Fuel + Maintenance + Other Expenses.
6. Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
7. Fuel efficiency (km/L) is recalculated after every completed trip with a logged fuel entry.

### Challenges This Software Solves
- Eliminates double-booking of vehicles/drivers through enforced status-based availability.
- Prevents overloading and associated safety/legal liability via automated capacity checks.
- Prevents dispatch of non-compliant drivers via automated license validation.
- Converts reactive maintenance into a system-enforced workflow that protects vehicle availability integrity.
- Replaces manual, delayed financial reconciliation with real-time, per-vehicle cost/ROI visibility.

---

# TASK 2 — Screen-by-Screen Analysis

## Screen 1: Login & Registration

**Purpose:** Secure, role-aware entry point; also handles new organization/account registration.

**UI Components:** Role-selector radio cards, email input, password input + visibility toggle, "Remember this device" checkbox, "Forgot Password" link, submit button with loading spinner state, Google SSO button, illustration/branding panel, registration variant (Full Name, Company Name, Work Email, Phone, Role dropdown, Password + Confirm Password with strength meter, Terms checkbox).

**User Actions:** Sign in, toggle password visibility, initiate password reset, register a new account, select a role at login.

**Navigation:** Success → Dashboard (Command Center). "Contact Sales" → external/marketing page. "Sign In" link on registration → Login.

**Data Required:** None on initial load (empty form state). Post-login: current user's name, role, and JWT are stored in session/auth context for use across the app.

**Required APIs (names only):** Login API, Logout API, Register API, Forgot Password API, Reset Password API.

**Required Database Tables:** User, Role.

**Frontend Validation:** Required email format; minimum password length; confirm-password match; terms checkbox required to submit; role selection required.

**Backend Validation:** Email uniqueness check; password hashed and never returned in any response; brute-force/rate-limiting on repeated failed logins; server-issued role claim overrides any client-submitted role.

**Business Rules:** The role radio button on login is UI convenience only — actual permissions come from the authenticated user's stored role, never from what's selected on the form.

**Edge Cases:** Wrong password repeated attempts (lockout/rate-limit), expired reset-password token, duplicate email on registration, network failure mid-submit (should not double-submit), user has no assigned role (should hard-block login with a clear message).

---

## Screen 2: Command Center (Main Dashboard)

**Purpose:** Single-glance operational snapshot of the entire fleet for daily decision-making.

**UI Components:** KPI cards (Active Fleet, Maintenance Alerts, Pending Cargo, Fleet Utilization %), filter bar (Vehicle Type, Status, Region, Date Range), "New Vehicle" / "New Trip" quick-action buttons, Recent Trips table with pagination, Vehicle Availability breakdown widget, Urgent Maintenance list widget, License Expiry widget, Fleet Utilization Trend bar chart, Trip Status Distribution donut chart, Recent Activity timeline, mobile bottom nav bar.

**User Actions:** Filter dashboard view by type/status/region/date, jump into a recent trip, trigger "New Vehicle"/"New Trip" flows, renew a license from the widget, view full maintenance schedule.

**Navigation:** → Vehicle Registry, → Trip Dispatcher, → Maintenance, → Driver Profiles (via widget links).

**Data Required:** Count of vehicles by status, count of maintenance alerts (with critical sub-count), count of pending/unassigned cargo, utilization percentage, list of the most recent trips (ID, vehicle, driver, destination, cargo, status), top urgent maintenance items, drivers with licenses expiring soon, 7-day utilization trend, trip status distribution percentages, recent activity log entries.

**Required APIs (names only):** Dashboard Analytics API, Recent Trips API, Vehicle Availability Summary API, Urgent Maintenance API, License Expiry Alert API, Recent Activity API.

**Required Database Tables:** Vehicle, Trip, Driver, Maintenance, Expense, FuelLog.

**Frontend Validation:** Date range must have start ≤ end; filter dropdowns constrained to valid enum values.

**Backend Validation:** All aggregation queries scoped to the authenticated user's organization (if multi-tenant); date-range bounds sanity-checked to prevent excessively expensive queries.

**Business Rules:** Utilization % = vehicles currently `On Trip` ÷ total active (non-retired) vehicles. "Critical" maintenance alerts are a subset of total alerts based on priority/overdue status.

**Edge Cases:** Zero vehicles/trips in the system (empty-state UI needed, not currently in the mock), filters that return no results, a vehicle appearing in two KPI buckets simultaneously due to a race condition (must be prevented by single source-of-truth status field), stale cached KPI data shown briefly after a status change elsewhere.

---

## Screen 3: Vehicle Registry (Asset Management)

**Purpose:** Full CRUD interface for the physical fleet asset inventory.

**UI Components:** Summary stat cards (Total/Available/On Trip/Under Maintenance), search bar, filter dropdowns (Type, Status, Capacity), sortable/paginated data table (Vehicle ID, License Plate, Name, Manufacturer/Model, Type, Capacity, Odometer, Status pill, row actions: view/edit/history), "New Vehicle" slide-over drawer form, view-details drawer (asset health bars, upcoming service), success toast notification, "Export Fleet Data" button.

**User Actions:** Add a new vehicle, edit an existing vehicle, view full details, retire ("Out of Service"), search/filter/sort, export data, jump to "Schedule Now" or "Assign Driver" from the details drawer.

**Navigation:** "Assign Driver" → Trip Dispatcher. "Schedule Now" → Maintenance screen.

**Data Required:** Full list of vehicles with all registry fields; per-vehicle health metrics (engine condition %, tire life %) and next scheduled service for the details drawer.

**Required APIs (names only):** List Vehicles API, Get Vehicle Details API, Create Vehicle API, Update Vehicle API, Update Vehicle Status API, Delete/Retire Vehicle API.

**Required Database Tables:** Vehicle, Maintenance (for health widget), Trip (for history tab).

**Frontend Validation:** License Plate required and pattern-checked; Max Load Capacity must be > 0; Manufacturing Year within a plausible range; required selects (Vehicle Type, Fuel Type) cannot be left at placeholder.

**Backend Validation:** License Plate uniqueness enforced at the database level; capacity stored/normalized in a single unit (kg) regardless of the unit selected in the form; status transitions restricted to the defined enum values.

**Business Rules:** Status cannot be manually forced to `Available` while an open Maintenance record exists for that vehicle — this is system-controlled, not user-editable in that scenario.

**Edge Cases:** Duplicate license plate submission, deleting a vehicle that has trip/expense history (should soft-delete, not hard-delete, to preserve records), retiring a vehicle mid-trip (should be blocked), capacity entered in the wrong unit (kg vs ton) causing false-positive overload warnings downstream.

---

## Screen 4: Trip Dispatcher & Management

**Purpose:** Core workflow for creating, validating, and dispatching cargo trips.

**UI Components:** Group-by/filter/sort toolbar, trips table (Trip ID, Vehicle Type, Origin, Destination, Driver, Cargo Weight, Status pill, row actions), pagination, "Dispatch New Trip" form (Vehicle select, Cargo Weight input with live capacity-violation warning banner, Driver select, Origin/Destination text fields, read-only Est. Fuel Cost, read-only Est. Distance, Trip Date, Dispatch Time, Notes textarea), safety-parameters confirmation indicator, "Save as Draft" and "Confirm & Dispatch" buttons.

**User Actions:** Create a draft or immediately dispatched trip, select vehicle and driver, enter cargo weight and route, save as draft, confirm dispatch, cancel a trip, filter/group/sort the trip list.

**Navigation:** Completed trips feed into the Fuel & Expense Logging screen for cost entry.

**Data Required:** List of currently available vehicles (filtered by status), list of currently available/license-valid drivers, real-time cargo-vs-capacity comparison, estimated fuel cost and distance (likely from a routing/estimation service).

**Required APIs (names only):** List Trips API, Get Trip Details API, Create Trip API, Update Trip API, Update Trip Status API, Delete Draft Trip API, Available Vehicles API, Available Drivers API.

**Required Database Tables:** Trip, Vehicle, Driver, FuelLog.

**Frontend Validation:** Real-time cargo-weight-exceeds-capacity check blocks the dispatch button and shows an inline error, as shown in the mock.

**Backend Validation (authoritative — repeats every frontend check server-side):** Vehicle status must be `Available`; Driver status must be `Available`/`On Duty`; Driver license must not be expired; `CargoWeight ≤ Vehicle.MaxCapacity`; Driver's license category must match the assigned vehicle's type.

**Business Rules:** On dispatch, `Vehicle.status → OnTrip` and `Driver.status → OnTrip` atomically. On completion, both revert to `Available`, and the vehicle's odometer updates. Trip lifecycle: `Draft → Dispatched → Completed → Archived`, or `Draft → Cancelled`.

**Edge Cases:** Two dispatchers attempting to assign the same vehicle simultaneously (race condition — needs transactional locking), cargo weight of exactly the max capacity (boundary condition — should this pass or fail? recommend `≤` passes), driver license expiring mid-trip (does not retroactively cancel an in-progress trip, but should block that driver's *next* assignment), trip cancellation after dispatch (must release the vehicle/driver back to `Available` and log a reason), incomplete/missing address fields on dispatch.

---

## Screen 5: Maintenance & Service Logs

**Purpose:** Preventative and reactive vehicle health/service tracking, with automatic dispatch-locking logic.

**UI Components:** Search/filter toolbar (Vehicle Type, Service Type, Status, Date Range, Sort), KPI cards (Total Service Logs, Vehicles In Maintenance, Upcoming Services, Total Maintenance Cost), service log table (Log ID, Vehicle, Service Type, Date, Cost, Status pill — active/in-progress rows visually flagged with a red border and "Dispatch Locked" tag), "Create New Service" slide-over drawer (Vehicle select with a live "vehicle in maintenance" warning banner, auto-filled License Plate, Service Type, Priority, Issue Description, Service Date, Est. Completion, Technician, Workshop, Est. Cost, Status select, Notes).

**User Actions:** Create a new service log, edit an existing one, mark a service complete, view repair history, view invoice.

**Navigation:** Directly affects Trip Dispatcher's available-vehicle pool while a service is active.

**Data Required:** Vehicle list for the select dropdown (with a maintenance-status flag), all open/closed service logs, cost totals for the KPI cards.

**Required APIs (names only):** List Maintenance Logs API, Get Maintenance Detail API, Create Maintenance Log API, Update Maintenance Log API, Complete Maintenance API.

**Required Database Tables:** Maintenance, Vehicle, Expense (cost roll-up).

**Frontend Validation:** Vehicle selection required before submission; Service Date must be ≤ Est. Completion Date; Est. Cost must be ≥ 0.

**Backend Validation:** Status transitions restricted to the defined workflow (`Scheduled → InProgress → AwaitingParts → Completed`); creating/activating a log for a vehicle automatically triggers the vehicle status update as a side effect within the same transaction.

**Business Rules:** Creating (or activating) a maintenance record sets `Vehicle.status = InShop`, removing it from dispatch eligibility. Marking a service `Completed` reverts the vehicle to `Available` — but only if no *other* open maintenance record exists for that same vehicle.

**Edge Cases:** Multiple simultaneous open maintenance records on the same vehicle (must track count, not a boolean, to correctly determine when to unlock), completing a maintenance log for a vehicle that was manually retired in the meantime, cost entered as negative, service scheduled far in the future vs. immediate (priority handling), workshop/technician left blank on a critical-priority record.

---

## Screen 6: Fuel & Expense Logging

**Purpose:** Records fuel and miscellaneous costs against completed trips for financial tracking.

**UI Components:** Search toolbar (Trip ID/Driver search, Group By, Filter by status, Sort), expense table (Trip ID, Driver avatar+name, Distance, Fuel Expense, Misc Expense, Status pill, row actions), pagination, "Add an Expense" slide-over drawer (Trip ID select restricted to completed trips, read-only auto-filled Driver/Vehicle/Distance, Fuel Quantity input, Fuel Cost input, Expense Category select, Misc Expense input, Expense Date picker, Notes textarea).

**User Actions:** Log a new fuel/expense entry against a completed trip, edit an existing entry, search/filter/group the expense list.

**Navigation:** Sourced entirely from completed Trip Dispatcher records; feeds directly into Operational Analytics.

**Data Required:** List of completed trips (for the Trip ID dropdown), each trip's associated driver/vehicle/distance for auto-fill, existing expense entries for the table.

**Required APIs (names only):** List Expenses API, Create Expense API, Update Expense API, List Completed Trips API, List Fuel Logs API, Create Fuel Log API.

**Required Database Tables:** Expense, FuelLog, Trip, Vehicle, Driver.

**Frontend Validation:** Trip must be selected from a list already restricted to `Completed` status; Fuel Quantity and Cost fields must be numeric and ≥ 0.

**Backend Validation:** Reject expense creation against a Trip that is not `Completed`; category restricted to the defined enum (Fuel, Repair, Toll, Parking, Food, Other).

**Business Rules:** `Total Operational Cost (per vehicle) = Σ Fuel + Σ Maintenance + Σ Other Expenses`. Fuel efficiency (km/L) recalculates automatically whenever a new fuel log is tied to a completed trip.

**Edge Cases:** Duplicate expense logged twice for the same trip (should warn, not silently allow), fuel quantity of 0 with a non-zero cost (data-entry error — flag for review), expense date before the trip's actual completion date (logically invalid), a trip with no fuel log ever recorded (should show as an open item somewhere, currently not represented in the mock).

---

## Screen 7: Driver Performance & Safety Profiles

**Purpose:** HR/compliance and safety-score tracking for the driver workforce.

**UI Components:** Search/filter/sort/group toolbar, driver table (Photo+Name+ID, License Number, License Expiry with "Expiring Soon"/"Expired" visual flags, Trip Completion % progress bar, Safety Score badge, Complaints count, Duty Status indicator dot, row actions: View/Edit/Suspend/Activate/Delete), pagination.

**User Actions:** View a driver's full profile, edit driver details, suspend or reactivate a driver, delete a driver record, filter by duty status or license-expiry window.

**Navigation:** Feeds directly into the Trip Dispatcher's driver-assignment eligibility logic.

**Data Required:** Full driver roster with license info, computed trip completion rate, computed safety score, complaint counts, current duty status.

**Required APIs (names only):** List Drivers API, Get Driver Details API, Create Driver API, Update Driver API, Update Driver Status API, Delete Driver API, Upload/Renew License API.

**Required Database Tables:** Driver, Trip (for completion-rate/safety-score derivation), Complaint/Incident (if tracked separately).

**Frontend Validation:** License Number required; License Expiry must be a future date at creation/renewal; contact info format-checked.

**Backend Validation:** License Number uniqueness per issuing authority; Safety Score bounded 0–100 server-side even if a bug attempts to push it out of range; Duty Status restricted to enum values.

**Business Rules:** A driver with an expired license is automatically ineligible for new trip assignment — this is enforced at Trip creation time, not just visually flagged here. A `Suspended` status is a hard block regardless of license validity. Trip Completion % and Safety Score are derived/rollup fields, not directly user-editable.

**Edge Cases:** Suspending a driver who is currently `On Trip` (should this be blocked until the trip completes, or allowed with a warning that they can't be re-assigned after?), license renewed with a past-dated expiry by mistake, deleting a driver with historical trip records (soft-delete required to preserve audit trail), safety score manually manipulated attempt (should be rejected — read-only computed field).

---

## Screen 8: Operational Analytics & Financial Reports

**Purpose:** Aggregated financial and operational performance reporting with export capability.

**UI Components:** Date-range/period selector ("This Quarter"), "Apply Filters" button, 3 KPI cards (Total Fuel Cost, Fleet ROI, Fleet Utilization Rate), Fuel Efficiency Trend line chart, Top 5 Costliest Vehicles ranked bar-list, Financial Summary table (Month, Revenue, Fuel Cost, Maintenance Cost, Net Profit pill, view action), Export dropdown (PDF Document / Excel Sheet / CSV File).

**User Actions:** Change the reporting period, apply filters, export the report in PDF/CSV/Excel, drill into a specific month's detail.

**Navigation:** Terminal/read-only screen — aggregates data from every other module; no forward navigation besides export/drill-down.

**Data Required:** Total fuel cost for the period, computed Fleet ROI %, Fleet Utilization %, monthly fuel-efficiency trend series, top 5 vehicles by cost, monthly Revenue/Fuel/Maintenance/Net Profit rows.

**Required APIs (names only):** Dashboard Analytics API, Monthly Report API, Vehicle Report API, Driver Report API, Export Report API.

**Required Database Tables:** Trip, Vehicle, Expense, FuelLog, Maintenance (read-heavy aggregation, ideally against a pre-computed Report/rollup table at scale).

**Frontend Validation:** Date-range bounded to periods with actual data; export format restricted to the three supported options.

**Backend Validation:** Requested date range sanity-checked to prevent unbounded/expensive queries; export generation authorized only for permitted roles (Fleet Manager, Financial Analyst).

**Business Rules:** Fuel Efficiency = distance traveled ÷ fuel consumed. Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost. Net Profit = Revenue − (Fuel Cost + Maintenance Cost).

**Edge Cases:** A month with zero trips (division-by-zero risk in ROI/efficiency calculations — must guard), export requested for a huge date range (should be queued as a background job, not block the request), revenue figure source is undefined in the current UI/SRS — this is flagged again in Task 4 below as a missing data flow.

---

# TASK 3 — User Flows by Role

### Fleet Manager
1. Login → lands on Command Center Dashboard.
2. Reviews KPIs: Active Fleet, Maintenance Alerts, Utilization.
3. Navigates to Vehicle Registry → registers a new vehicle (fills form → submits → sees success toast).
4. Navigates to Driver Performance screen → reviews/edits a driver profile if needed.
5. Navigates to Maintenance & Service Logs → creates a service log for a vehicle flagged for repair → vehicle automatically locks from dispatch.
6. Returns to Dashboard → confirms Maintenance Alert count updated and Vehicle Availability widget reflects the change.
7. Periodically visits Operational Analytics → reviews Fleet ROI and exports the monthly financial report.
8. Marks the maintenance log `Completed` once work is finished → vehicle automatically unlocks and returns to `Available`.

### Dispatcher
1. Login → lands on Dashboard, checks Pending Cargo and Active Fleet counts.
2. Navigates to Trip Dispatcher → reviews the existing trips table.
3. Clicks "Dispatch New Trip" → selects an available vehicle from the dropdown.
4. Enters cargo weight → system live-validates against the selected vehicle's max capacity; if it fails, the Dispatcher must either reduce cargo or pick a larger vehicle.
5. Selects an available, license-valid driver.
6. Enters origin/destination → system estimates fuel cost/distance.
7. Chooses "Save as Draft" (to revisit later) or "Confirm & Dispatch" (locks in Vehicle/Driver as `On Trip`).
8. Monitors the trip through its lifecycle; upon return, updates status to `Completed` and enters the final odometer reading.
9. Trip becomes selectable in the Fuel & Expense Logging screen for cost entry (typically done by Financial Analyst or Fleet Manager).

### Safety Officer
1. Login → lands on Dashboard, checks the License Expiry widget.
2. Navigates to Driver Performance & Safety Profiles.
3. Filters by "License Expiring Soon" or "Expired."
4. Opens a flagged driver's profile → reviews Trip Completion %, Safety Score, and Complaint count.
5. If the driver has a valid new license, updates the License Expiry date (renewal).
6. If the driver is unsafe (low score, high complaints, or expired/invalid license), toggles Duty Status to `Suspended`.
7. System immediately removes that driver from the Trip Dispatcher's assignable pool.
8. Later, if the issue is resolved, reactivates the driver via the Duty Status toggle.

### Financial Analyst
1. Login → lands on Dashboard, checks Pending Cargo/Utilization for context.
2. Navigates to Fuel & Expense Logging.
3. Selects a completed Trip ID from the dropdown → system auto-fills Driver/Vehicle/Distance.
4. Enters Fuel Quantity, Fuel Cost, Expense Category, and any Misc Expense → submits.
5. Navigates to Operational Analytics & Financial Reports.
6. Reviews Total Fuel Cost, Fleet ROI, and the Top 5 Costliest Vehicles list.
7. Reviews the monthly Financial Summary table for Net Profit trends.
8. Selects "Export Report" → chooses PDF/Excel/CSV → downloads for payroll/audit handoff.

---

# TASK 4 — Missing Features (Gap Analysis: UI vs. SRS/PDF)

### Missing Screens
| Screen | Why It's Needed | Referenced In |
|---|---|---|
| **User/Role Management** | SRS explicitly lists "Role Management" as a module, but no screen exists to create/edit users or assign roles — currently role selection only happens at login/registration. | SRS §3, RBAC matrix |
| **Notifications Center** | SRS's Future Enhancements mention "Real-time fleet alerts," but license-expiry/maintenance-due alerts currently only appear passively on the Dashboard widgets — no dedicated notification inbox or push mechanism exists. | SRS §13 |
| **Driver Trip History / Detail View** | SRS Module 4 explicitly lists "View Trip History" as a driver function, but no screen shows a driver's individual past-trip log. | SRS Module 4 |
| **Settings / Organization Profile** | The sidebar nav includes a "Settings" link on every screen, but no corresponding screen was included in the export. | UI sidebar (all screens) |
| **Vehicle Maintenance History Detail** | The Vehicle Registry drawer shows "Upcoming Service" but not a full historical service log per vehicle (only reachable indirectly via the Maintenance screen's global table). | PDF Page 3, Maintenance Logic Link |

### Missing Features
1. **Document upload for driver licenses** — SRS Module 4 lists "Upload License" as a function, but the Driver screen UI has no file-upload field; only text fields for license number/expiry exist.
2. **Insurance/registration document storage for vehicles** — Vehicle form captures "Insurance Expiry" as a date but no attachment upload, despite the operational need to store the actual document.
3. **Revenue input mechanism** — Analytics screen displays "Revenue" and computes Net Profit/ROI from it, but no screen or API in the entire export actually captures revenue data (e.g., per-trip billing, freight invoicing). This is a real gap: **ROI and Net Profit cannot be computed without a revenue source.**
4. **Multi-driver / co-driver trip support** — Not present in the UI or explicitly in the SRS, but common in real fleet operations for long-haul trips; worth flagging as a near-term addition even if out of current scope.
5. **GPS/live tracking** — Explicitly deferred to "Future Enhancements" in the SRS; correctly excluded from current scope, just noting it's not present.
6. **Audit log / activity trail beyond the Dashboard widget** — The Dashboard shows a "Recent Activity" feed, but there's no dedicated, filterable, exportable audit log screen for compliance purposes.

### Missing Validations
1. **Odometer regression check** — no confirmed validation preventing a Trip completion from being logged with a lower odometer reading than the vehicle's current value.
2. **Driver license-category-to-vehicle-type match** — described as a business rule in the SRS ("Vehicle Category" is a driver field) but the Trip Dispatcher form's Driver dropdown gives no visual indication of category mismatch, unlike the cargo-capacity check which is prominently displayed.
3. **Duplicate expense prevention** — no validation shown preventing the same Trip ID from having multiple, possibly duplicate, fuel entries logged against it.
4. **Cross-field date validation** — Maintenance form doesn't visibly enforce Service Date ≤ Est. Completion Date, and the Vehicle form doesn't enforce Registration Date ≤ Insurance Expiry.

### Missing User Flows
1. **Trip rejection/re-assignment flow** — no flow exists for what happens if a Dispatcher needs to reassign a trip mid-dispatch (e.g., vehicle breaks down before departure) beyond outright cancellation.
2. **Password change flow (while logged in)** — only "Forgot Password" (logged-out) exists; no in-app "Change Password" flow under a user profile/settings area.
3. **Approval workflow** — SRS's RBAC matrix references "Approve" as a Fleet Manager permission for Trips, but no screen or button in the UI export represents a trip-approval step distinct from dispatch.
4. **Report drill-down flow** — the Analytics table has a "view" action per month, but no destination screen for that drill-down was included in the export.

### Suggested Improvements
1. **Add a Revenue capture point** — either a per-trip billing field on the Trip form, or a lightweight Invoicing module, since ROI/Net Profit are currently uncomputable without it.
2. **Build the User/Role Management screen** early — it's foundational (referenced by RBAC across every other module) and currently the biggest structural gap versus the SRS.
3. **Add a persistent Notifications component** (bell icon dropdown, already stubbed visually in the header across all screens but non-functional) tied to license expiry and maintenance-due triggers.
4. **Introduce document/file upload** for driver licenses and vehicle insurance — low-effort addition (S3/object storage + a `Document` table) that closes a real compliance gap.
5. **Surface the license-category mismatch warning** in the Trip Dispatcher form with the same visual prominence as the cargo-capacity warning, since both are equally safety-critical business rules per the SRS.
6. **Add a lightweight Settings screen** so the sidebar link across every screen isn't a dead end.

---

*End of Phase 1 analysis. No code has been generated. This document is the foundation for Phase 2 (Functional/Non-Functional Requirements, Database Design, API Planning) on your confirmation.*
