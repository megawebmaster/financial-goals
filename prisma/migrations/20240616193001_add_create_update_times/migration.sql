/*
  Warnings:

  - Added the required column `createdAt` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `BudgetGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BudgetGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `BudgetSavingsEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BudgetSavingsEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `BudgetUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BudgetUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BudgetGoal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BudgetSavingsEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BudgetUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
