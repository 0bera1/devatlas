-- Add split name columns (nullable for backfill)
ALTER TABLE "User" ADD COLUMN "first_name" TEXT;
ALTER TABLE "User" ADD COLUMN "last_name" TEXT;

-- Backfill from legacy `name` (single token duplicates into last_name for valid initials)
UPDATE "User"
SET
  "first_name" = CASE
    WHEN "name" IS NULL OR btrim("name") = '' THEN 'Kullanıcı'
    WHEN strpos(btrim("name"), ' ') > 0 THEN split_part(btrim("name"), ' ', 1)
    ELSE btrim("name")
  END,
  "last_name" = CASE
    WHEN "name" IS NULL OR btrim("name") = '' THEN 'Hesap'
    WHEN strpos(btrim("name"), ' ') > 0 THEN btrim(substring(btrim("name") from strpos(btrim("name"), ' ') + 1))
    ELSE btrim("name")
  END;

ALTER TABLE "User" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "last_name" SET NOT NULL;

ALTER TABLE "User" DROP COLUMN "name";
