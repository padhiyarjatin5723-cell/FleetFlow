-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."TripStatus" AS ENUM ('PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ExpenseType" AS ENUM ('TOLL', 'FOOD', 'PARKING', 'REPAIR', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('RC', 'INSURANCE', 'PUC', 'LICENSE', 'INVOICE', 'DELIVERY_CHALLAN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "public"."role" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "permissions" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_token" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_by_ip" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" UUID NOT NULL,
    "registration_no" VARCHAR(30) NOT NULL,
    "vin" VARCHAR(100),
    "make" VARCHAR(80) NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "year" INTEGER NOT NULL,
    "vehicle_type" VARCHAR(50) NOT NULL,
    "capacity_kg" DOUBLE PRECISION NOT NULL,
    "fuel_type" VARCHAR(30) NOT NULL,
    "status" "public"."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "purchase_date" DATE,
    "acquisition_cost" DECIMAL(12,2),
    "current_odometer" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."driver" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "employee_code" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "license_expiry" DATE NOT NULL,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "joining_date" DATE,
    "address" TEXT,
    "emergency_contact" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trip" (
    "id" UUID NOT NULL,
    "trip_number" VARCHAR(50) NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "source" VARCHAR(150) NOT NULL,
    "destination" VARCHAR(150) NOT NULL,
    "cargo_description" TEXT,
    "cargo_weight_kg" DOUBLE PRECISION NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "status" "public"."TripStatus" NOT NULL DEFAULT 'PLANNED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "trip_id" UUID,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "service_date" DATE NOT NULL,
    "next_service_date" DATE,
    "odometer_km" DOUBLE PRECISION,
    "cost" DECIMAL(12,2) NOT NULL,
    "vendor" VARCHAR(150),
    "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_log" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "tripId" UUID,
    "fuelDate" DATE NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerLiter" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "odometerKm" DOUBLE PRECISION NOT NULL,
    "stationName" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "expenseType" "public"."ExpenseType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "expenseDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document" (
    "id" UUID NOT NULL,
    "vehicleId" UUID,
    "driverId" UUID,
    "documentType" "public"."DocumentType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "file_url" TEXT NOT NULL,
    "expiryDate" DATE,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(150) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_report" (
    "id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFuelCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "public"."role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_role_id_idx" ON "public"."user"("role_id");

-- CreateIndex
CREATE INDEX "user_active_deleted_at_idx" ON "public"."user"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "public"."refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_user_id_idx" ON "public"."refresh_token"("user_id");

-- CreateIndex
CREATE INDEX "refresh_token_expires_at_idx" ON "public"."refresh_token"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_no_key" ON "public"."vehicles"("registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "public"."vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "public"."vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_deleted_at_idx" ON "public"."vehicles"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "driver_employee_code_key" ON "public"."driver"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "driver_email_key" ON "public"."driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "driver_license_number_key" ON "public"."driver"("license_number");

-- CreateIndex
CREATE INDEX "driver_status_idx" ON "public"."driver"("status");

-- CreateIndex
CREATE INDEX "driver_deleted_at_idx" ON "public"."driver"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "trip_trip_number_key" ON "public"."trip"("trip_number");

-- CreateIndex
CREATE INDEX "trip_vehicle_id_idx" ON "public"."trip"("vehicle_id");

-- CreateIndex
CREATE INDEX "trip_driver_id_idx" ON "public"."trip"("driver_id");

-- CreateIndex
CREATE INDEX "trip_status_idx" ON "public"."trip"("status");

-- CreateIndex
CREATE INDEX "trip_deleted_at_idx" ON "public"."trip"("deleted_at");

-- CreateIndex
CREATE INDEX "maintenance_vehicle_id_idx" ON "public"."maintenance"("vehicle_id");

-- CreateIndex
CREATE INDEX "maintenance_trip_id_idx" ON "public"."maintenance"("trip_id");

-- CreateIndex
CREATE INDEX "maintenance_status_idx" ON "public"."maintenance"("status");

-- CreateIndex
CREATE INDEX "fuel_log_vehicleId_idx" ON "public"."fuel_log"("vehicleId");

-- CreateIndex
CREATE INDEX "fuel_log_tripId_idx" ON "public"."fuel_log"("tripId");

-- CreateIndex
CREATE INDEX "expense_tripId_idx" ON "public"."expense"("tripId");

-- CreateIndex
CREATE INDEX "document_vehicleId_idx" ON "public"."document"("vehicleId");

-- CreateIndex
CREATE INDEX "document_driverId_idx" ON "public"."document"("driverId");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "public"."notification"("userId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "public"."audit_log"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_report_month_year_key" ON "public"."monthly_report"("month", "year");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trip" ADD CONSTRAINT "trip_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trip" ADD CONSTRAINT "trip_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance" ADD CONSTRAINT "maintenance_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance" ADD CONSTRAINT "maintenance_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_log" ADD CONSTRAINT "fuel_log_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_log" ADD CONSTRAINT "fuel_log_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "document_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "document_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
