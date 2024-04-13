-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BudgetGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "requiredAmount" TEXT NOT NULL,
    "currentAmount" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "BudgetGoal_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BudgetGoal" ("budgetId", "currentAmount", "id", "name", "priority", "requiredAmount", "status") SELECT "budgetId", "currentAmount", "id", "name", "priority", "requiredAmount", "status" FROM "BudgetGoal";
DROP TABLE "BudgetGoal";
ALTER TABLE "new_BudgetGoal" RENAME TO "BudgetGoal";
CREATE TABLE "new_BudgetSavingsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetSavingsEntry_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetSavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetSavingsEntry" ("id", "userId", "value") SELECT "id", "userId", "value" FROM "BudgetSavingsEntry";
DROP TABLE "BudgetSavingsEntry";
ALTER TABLE "new_BudgetSavingsEntry" RENAME TO "BudgetSavingsEntry";
CREATE TABLE "new_BudgetUser" (
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,

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
