-- Bilingual knowledge narratives (TR / EN)
ALTER TABLE "SystemDiagram" ADD COLUMN "narrative_tr" TEXT;
ALTER TABLE "SystemDiagram" ADD COLUMN "narrative_en" TEXT;
UPDATE "SystemDiagram" SET "narrative_tr" = "narrative", "narrative_en" = "narrative" WHERE "narrative" IS NOT NULL;
ALTER TABLE "SystemDiagram" DROP COLUMN "narrative";

ALTER TABLE "SystemFlow" ADD COLUMN "narrative_tr" TEXT;
ALTER TABLE "SystemFlow" ADD COLUMN "narrative_en" TEXT;
UPDATE "SystemFlow" SET "narrative_tr" = "narrative", "narrative_en" = "narrative" WHERE "narrative" IS NOT NULL;
ALTER TABLE "SystemFlow" DROP COLUMN "narrative";

ALTER TABLE "SystemFlowStep" ADD COLUMN "narrative_tr" TEXT;
ALTER TABLE "SystemFlowStep" ADD COLUMN "narrative_en" TEXT;
UPDATE "SystemFlowStep" SET "narrative_tr" = "narrative", "narrative_en" = "narrative" WHERE "narrative" IS NOT NULL;
ALTER TABLE "SystemFlowStep" DROP COLUMN "narrative";
