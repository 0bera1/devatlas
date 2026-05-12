-- CreateTable
CREATE TABLE "DiagramCollaborator" (
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramCollaborator_pkey" PRIMARY KEY ("diagramId","userId")
);

-- CreateIndex
CREATE INDEX "DiagramCollaborator_userId_idx" ON "DiagramCollaborator"("userId");

-- AddForeignKey
ALTER TABLE "DiagramCollaborator" ADD CONSTRAINT "DiagramCollaborator_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiagramCollaborator" ADD CONSTRAINT "DiagramCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
