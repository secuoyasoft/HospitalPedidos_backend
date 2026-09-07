-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "last_entry_date" TIMESTAMP(3),
ADD COLUMN     "last_exit_date" TIMESTAMP(3),
ADD COLUMN     "low_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "preferred_measure" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0;
