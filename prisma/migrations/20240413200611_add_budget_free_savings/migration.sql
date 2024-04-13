-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentSavings" TEXT NOT NULL,
    "freeSavings" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Budget" ("currentSavings", "id") SELECT "currentSavings", "id" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
