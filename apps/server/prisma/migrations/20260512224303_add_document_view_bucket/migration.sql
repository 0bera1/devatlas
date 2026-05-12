-- CreateTable
CREATE TABLE "DocumentViewBucket" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "bucketDate" DATE NOT NULL,

    CONSTRAINT "DocumentViewBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentViewBucket_documentId_idx" ON "DocumentViewBucket"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentViewBucket_documentId_viewerKey_bucketDate_key" ON "DocumentViewBucket"("documentId", "viewerKey", "bucketDate");

-- AddForeignKey
ALTER TABLE "DocumentViewBucket" ADD CONSTRAINT "DocumentViewBucket_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
