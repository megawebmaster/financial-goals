-- CreateTable
CREATE TABLE "BudgetInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    CONSTRAINT "BudgetInvitation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetInvitation_budgetId_userId_key" ON "BudgetInvitation"("budgetId", "userId");
