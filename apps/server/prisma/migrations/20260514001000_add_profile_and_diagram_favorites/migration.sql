-- Diagram.favoriteCount alanı (Document.favoriteCount ile paralel).
ALTER TABLE "Diagram"
  ADD COLUMN "favoriteCount" INTEGER NOT NULL DEFAULT 0;

-- Kullanıcı–diyagram favori tablosu (Favorite tablosunun diyagram eşdeğeri).
CREATE TABLE "DiagramFavorite" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "diagramId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DiagramFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DiagramFavorite_userId_diagramId_key"
  ON "DiagramFavorite" ("userId", "diagramId");

CREATE INDEX "DiagramFavorite_diagramId_idx"
  ON "DiagramFavorite" ("diagramId");

ALTER TABLE "DiagramFavorite"
  ADD CONSTRAINT "DiagramFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiagramFavorite"
  ADD CONSTRAINT "DiagramFavorite_diagramId_fkey"
  FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Kullanıcı günlük aktivite kovası (profil sayfasındaki heatmap için).
CREATE TABLE "UserActivityBucket" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "bucketDate" DATE NOT NULL,
  "count"      INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "UserActivityBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserActivityBucket_userId_bucketDate_key"
  ON "UserActivityBucket" ("userId", "bucketDate");

CREATE INDEX "UserActivityBucket_userId_idx"
  ON "UserActivityBucket" ("userId");

ALTER TABLE "UserActivityBucket"
  ADD CONSTRAINT "UserActivityBucket_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
