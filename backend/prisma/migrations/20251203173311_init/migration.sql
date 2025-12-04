-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "full_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "train_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_time" TIME,
    "end_time" TIME,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_stations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" UUID NOT NULL,
    "station_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "distance_from_start" DECIMAL(8,2) NOT NULL,
    "estimated_duration" INTEGER,
    "stop_duration" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."live_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "train_number" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "speed" DECIMAL(5,2) DEFAULT 0,
    "heading" DECIMAL(5,2) DEFAULT 0,
    "accuracy" DECIMAL(5,2) DEFAULT 0,
    "device_id" TEXT,
    "battery_level" INTEGER,
    "signal_strength" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "train_number" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "speed" DECIMAL(5,2) DEFAULT 0,
    "heading" DECIMAL(5,2) DEFAULT 0,
    "device_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "record_id" UUID,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "routes_train_number_key" ON "public"."routes"("train_number");

-- CreateIndex
CREATE UNIQUE INDEX "stations_code_key" ON "public"."stations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "route_stations_route_id_sequence_key" ON "public"."route_stations"("route_id", "sequence");

-- CreateIndex
CREATE INDEX "live_locations_train_number_idx" ON "public"."live_locations"("train_number");

-- CreateIndex
CREATE INDEX "live_locations_timestamp_idx" ON "public"."live_locations"("timestamp");

-- CreateIndex
CREATE INDEX "location_history_train_number_timestamp_idx" ON "public"."location_history"("train_number", "timestamp");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "public"."audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "public"."audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_table_name_idx" ON "public"."audit_log"("table_name");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "public"."audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_stations" ADD CONSTRAINT "route_stations_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_stations" ADD CONSTRAINT "route_stations_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_locations" ADD CONSTRAINT "live_locations_train_number_fkey" FOREIGN KEY ("train_number") REFERENCES "public"."routes"("train_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_history" ADD CONSTRAINT "location_history_train_number_fkey" FOREIGN KEY ("train_number") REFERENCES "public"."routes"("train_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
