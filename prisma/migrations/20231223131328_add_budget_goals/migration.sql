-- CreateTable
CREATE TABLE "BudgetGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "requiredAmount" TEXT NOT NULL,
    CONSTRAINT "BudgetGoal_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
