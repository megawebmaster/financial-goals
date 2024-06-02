-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetUser" (
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("budgetId", "userId"),
    CONSTRAINT "BudgetUser_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetUser" ("budgetId", "isOwner", "key", "name", "userId") SELECT "budgetId", "isOwner", "key", "name", "userId" FROM "BudgetUser";
DROP TABLE "BudgetUser";
ALTER TABLE "new_BudgetUser" RENAME TO "BudgetUser";
CREATE UNIQUE INDEX "BudgetUser_userId_name_key" ON "BudgetUser"("userId", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
