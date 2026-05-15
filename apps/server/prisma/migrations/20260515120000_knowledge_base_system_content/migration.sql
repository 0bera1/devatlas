-- CreateTable
CREATE TABLE "SystemDocument" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDiagram" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemDiagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDiagramNode" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "relatedDiagramId" TEXT,
    "extras" JSONB,

    CONSTRAINT "SystemDiagramNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDiagramEdge" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemDiagramEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemFlow" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemFlowStep" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "SystemFlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemDocument_slug_key" ON "SystemDocument"("slug");

-- CreateIndex
CREATE INDEX "SystemDocument_sortOrder_idx" ON "SystemDocument"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SystemDiagram_slug_key" ON "SystemDiagram"("slug");

-- CreateIndex
CREATE INDEX "SystemDiagram_sortOrder_idx" ON "SystemDiagram"("sortOrder");

-- CreateIndex
CREATE INDEX "SystemDiagramNode_diagramId_idx" ON "SystemDiagramNode"("diagramId");

-- CreateIndex
CREATE INDEX "SystemDiagramEdge_diagramId_idx" ON "SystemDiagramEdge"("diagramId");

-- CreateIndex
CREATE INDEX "SystemDiagramEdge_fromNodeId_idx" ON "SystemDiagramEdge"("fromNodeId");

-- CreateIndex
CREATE INDEX "SystemDiagramEdge_toNodeId_idx" ON "SystemDiagramEdge"("toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemFlow_slug_key" ON "SystemFlow"("slug");

-- CreateIndex
CREATE INDEX "SystemFlow_sortOrder_idx" ON "SystemFlow"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SystemFlowStep_flowId_stepOrder_key" ON "SystemFlowStep"("flowId", "stepOrder");

-- CreateIndex
CREATE INDEX "SystemFlowStep_flowId_idx" ON "SystemFlowStep"("flowId");

-- CreateIndex
CREATE INDEX "SystemFlowStep_diagramId_idx" ON "SystemFlowStep"("diagramId");

-- AddForeignKey
ALTER TABLE "SystemDiagramNode" ADD CONSTRAINT "SystemDiagramNode_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "SystemDiagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDiagramEdge" ADD CONSTRAINT "SystemDiagramEdge_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "SystemDiagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDiagramEdge" ADD CONSTRAINT "SystemDiagramEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "SystemDiagramNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDiagramEdge" ADD CONSTRAINT "SystemDiagramEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "SystemDiagramNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemFlowStep" ADD CONSTRAINT "SystemFlowStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "SystemFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemFlowStep" ADD CONSTRAINT "SystemFlowStep_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "SystemDiagram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
