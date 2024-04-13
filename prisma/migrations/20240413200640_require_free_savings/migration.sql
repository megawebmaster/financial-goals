-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentSavings" TEXT NOT NULL,
    "freeSavings" TEXT NOT NULL
);
INSERT INTO "new_Budget" ("currentSavings", "freeSavings", "id") SELECT "currentSavings", "freeSavings", "id" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
