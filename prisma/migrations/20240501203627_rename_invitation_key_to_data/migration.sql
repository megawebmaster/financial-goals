/*
  Warnings:

  - You are about to drop the column `key` on the `BudgetInvitation` table. All the data in the column will be lost.
  - Added the required column `data` to the `BudgetInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetInvitation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetInvitation" ("budgetId", "expiresAt", "id", "userId") SELECT "budgetId", "expiresAt", "id", "userId" FROM "BudgetInvitation";
DROP TABLE "BudgetInvitation";
ALTER TABLE "new_BudgetInvitation" RENAME TO "BudgetInvitation";
CREATE UNIQUE INDEX "BudgetInvitation_budgetId_userId_key" ON "BudgetInvitation"("budgetId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
