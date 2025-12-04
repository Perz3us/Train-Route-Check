-- AlterTable
ALTER TABLE "public"."routes" ADD COLUMN     "train_id" UUID;

-- CreateTable
CREATE TABLE "public"."trains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "train_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trains_train_number_key" ON "public"."trains"("train_number");

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "public"."trains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
