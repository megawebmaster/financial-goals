/*
  Warnings:

  - You are about to drop the column `value` on the `BudgetSavingsEntry` table. All the data in the column will be lost.
  - Added the required column `amount` to the `BudgetSavingsEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `BudgetSavingsEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetSavingsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" DATETIME NOT NULL,
    "amount" TEXT NOT NULL,
    CONSTRAINT "BudgetSavingsEntry_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetSavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BudgetSavingsEntry" ("budgetId", "id", "userId") SELECT "budgetId", "id", "userId" FROM "BudgetSavingsEntry";
DROP TABLE "BudgetSavingsEntry";
ALTER TABLE "new_BudgetSavingsEntry" RENAME TO "BudgetSavingsEntry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
