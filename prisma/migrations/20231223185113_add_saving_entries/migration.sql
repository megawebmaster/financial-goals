-- CreateTable
CREATE TABLE "BudgetSavingsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetSavingsEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
