/*
  Warnings:

  - You are about to drop the column `userOrder` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userPurchase` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userOrder",
DROP COLUMN "userPurchase",
ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrderStatic" (
    "id" SERIAL NOT NULL,
    "status" "Order_Status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userPurchase" TEXT NOT NULL DEFAULT '',
    "userOrder" TEXT NOT NULL DEFAULT '',
    "quantity_purchase" INTEGER NOT NULL,
    "quantity_details" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "hospital_id" INTEGER NOT NULL,

    CONSTRAINT "OrderStatic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemStatic" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "amount_measure" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "buy_check" BOOLEAN NOT NULL DEFAULT false,
    "observation" TEXT,
    "order_static_id" INTEGER NOT NULL,

    CONSTRAINT "OrderItemStatic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatic" ADD CONSTRAINT "OrderStatic_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemStatic" ADD CONSTRAINT "OrderItemStatic_order_static_id_fkey" FOREIGN KEY ("order_static_id") REFERENCES "OrderStatic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
