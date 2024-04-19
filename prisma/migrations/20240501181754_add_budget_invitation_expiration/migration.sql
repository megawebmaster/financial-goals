/*
  Warnings:

  - Added the required column `expiresAt` to the `BudgetInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetInvitation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetInvitation" ("budgetId", "id", "key", "userId") SELECT "budgetId", "id", "key", "userId" FROM "BudgetInvitation";
DROP TABLE "BudgetInvitation";
ALTER TABLE "new_BudgetInvitation" RENAME TO "BudgetInvitation";
CREATE UNIQUE INDEX "BudgetInvitation_budgetId_userId_key" ON "BudgetInvitation"("budgetId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
