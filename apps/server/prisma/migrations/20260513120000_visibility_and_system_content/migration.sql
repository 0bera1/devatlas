-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");

-- CreateTable
CREATE TABLE "SystemContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemContent_type_idx" ON "SystemContent"("type");
