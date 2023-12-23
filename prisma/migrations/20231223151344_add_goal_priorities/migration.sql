/*
  Warnings:

  - Added the required column `priority` to the `BudgetGoal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "requiredAmount" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    CONSTRAINT "BudgetGoal_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetGoal" ("budgetId", "id", "name", "requiredAmount") SELECT "budgetId", "id", "name", "requiredAmount" FROM "BudgetGoal";
DROP TABLE "BudgetGoal";
ALTER TABLE "new_BudgetGoal" RENAME TO "BudgetGoal";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
