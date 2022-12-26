-- CreateTable
CREATE TABLE "set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_svg_uri" TEXT NOT NULL,
    "card_count" INTEGER NOT NULL,
    "released_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "printed_name" TEXT,
    "image" TEXT,
    "collector_number" TEXT NOT NULL,
    "set_id" TEXT NOT NULL,
    CONSTRAINT "card_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "set_code_key" ON "set"("code");

-- CreateIndex
CREATE INDEX "set_released_at_idx" ON "set"("released_at" DESC);
