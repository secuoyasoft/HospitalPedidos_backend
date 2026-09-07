-- CreateEnum
CREATE TYPE "Movement_Type" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "Movement" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "measure" TEXT NOT NULL,
    "movement_type" "Movement_Type" NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observation" TEXT,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);
