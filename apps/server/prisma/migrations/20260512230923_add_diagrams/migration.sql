-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Diagram_ownerId_idx" ON "Diagram"("ownerId");

-- CreateIndex
CREATE INDEX "Diagram_visibility_idx" ON "Diagram"("visibility");

-- CreateIndex
CREATE INDEX "Node_diagramId_idx" ON "Node"("diagramId");

-- CreateIndex
CREATE INDEX "Edge_diagramId_idx" ON "Edge"("diagramId");

-- CreateIndex
CREATE INDEX "Edge_fromNodeId_idx" ON "Edge"("fromNodeId");

-- CreateIndex
CREATE INDEX "Edge_toNodeId_idx" ON "Edge"("toNodeId");

-- AddForeignKey
ALTER TABLE "Diagram" ADD CONSTRAINT "Diagram_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
