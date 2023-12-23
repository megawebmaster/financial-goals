-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "requiredAmount" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "BudgetGoal_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetGoal" ("budgetId", "id", "name", "priority", "requiredAmount") SELECT "budgetId", "id", "name", "priority", "requiredAmount" FROM "BudgetGoal";
DROP TABLE "BudgetGoal";
ALTER TABLE "new_BudgetGoal" RENAME TO "BudgetGoal";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
