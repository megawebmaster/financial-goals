-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetSavingsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER,
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetSavingsEntry_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetSavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BudgetSavingsEntry" ("budgetId", "id", "userId", "value") SELECT "budgetId", "id", "userId", "value" FROM "BudgetSavingsEntry";
DROP TABLE "BudgetSavingsEntry";
ALTER TABLE "new_BudgetSavingsEntry" RENAME TO "BudgetSavingsEntry";
CREATE TABLE "new_BudgetInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetInvitation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetInvitation" ("budgetId", "data", "expiresAt", "id", "userId") SELECT "budgetId", "data", "expiresAt", "id", "userId" FROM "BudgetInvitation";
DROP TABLE "BudgetInvitation";
ALTER TABLE "new_BudgetInvitation" RENAME TO "BudgetInvitation";
CREATE UNIQUE INDEX "BudgetInvitation_budgetId_userId_key" ON "BudgetInvitation"("budgetId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
