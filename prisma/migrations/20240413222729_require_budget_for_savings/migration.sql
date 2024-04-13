-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetSavingsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetSavingsEntry_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetSavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetSavingsEntry" ("budgetId", "id", "userId", "value") SELECT "budgetId", "id", "userId", "value" FROM "BudgetSavingsEntry";
DROP TABLE "BudgetSavingsEntry";
ALTER TABLE "new_BudgetSavingsEntry" RENAME TO "BudgetSavingsEntry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
