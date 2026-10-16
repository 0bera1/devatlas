-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "InterviewQuestionCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DEVOPS', 'ARCHITECTURE', 'GENERAL');

-- CreateEnum
CREATE TYPE "InterviewKnowledgeResourceType" AS ENUM ('DOCUMENT', 'DIAGRAM', 'FLOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "ownerId" TEXT NOT NULL,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
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
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "relatedDiagramId" TEXT,
    "extras" JSONB,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagramCollaborator" (
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramCollaborator_pkey" PRIMARY KEY ("diagramId","userId")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "ownerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTag" (
    "documentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "DocumentTag_pkey" PRIMARY KEY ("documentId","tagId")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagramFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityBucket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bucketDate" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserActivityBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentViewBucket" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "bucketDate" DATE NOT NULL,

    CONSTRAINT "DocumentViewBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemContent_pkey" PRIMARY KEY ("id")
);

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
    "narrative_tr" TEXT,
    "narrative_en" TEXT,
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
    "narrative_tr" TEXT,
    "narrative_en" TEXT,
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
    "narrative_tr" TEXT,
    "narrative_en" TEXT,

    CONSTRAINT "SystemFlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "question_en" TEXT,
    "answer" TEXT NOT NULL,
    "answer_en" TEXT,
    "category" "InterviewQuestionCategory" NOT NULL,
    "tags" TEXT[],
    "difficulty" TEXT,
    "question_key" TEXT NOT NULL,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestionKnowledgeLink" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "resource_type" "InterviewKnowledgeResourceType" NOT NULL,
    "resource_slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InterviewQuestionKnowledgeLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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

-- CreateIndex
CREATE INDEX "DiagramCollaborator_userId_idx" ON "DiagramCollaborator"("userId");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");

-- CreateIndex
CREATE INDEX "Document_categoryId_idx" ON "Document"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "DocumentTag_tagId_idx" ON "DocumentTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_documentId_key" ON "Favorite"("userId", "documentId");

-- CreateIndex
CREATE INDEX "DiagramFavorite_diagramId_idx" ON "DiagramFavorite"("diagramId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagramFavorite_userId_diagramId_key" ON "DiagramFavorite"("userId", "diagramId");

-- CreateIndex
CREATE INDEX "UserActivityBucket_userId_idx" ON "UserActivityBucket"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivityBucket_userId_bucketDate_key" ON "UserActivityBucket"("userId", "bucketDate");

-- CreateIndex
CREATE INDEX "DocumentViewBucket_documentId_idx" ON "DocumentViewBucket"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentViewBucket_documentId_viewerKey_bucketDate_key" ON "DocumentViewBucket"("documentId", "viewerKey", "bucketDate");

-- CreateIndex
CREATE INDEX "SystemContent_type_idx" ON "SystemContent"("type");

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
CREATE INDEX "SystemFlowStep_flowId_idx" ON "SystemFlowStep"("flowId");

-- CreateIndex
CREATE INDEX "SystemFlowStep_diagramId_idx" ON "SystemFlowStep"("diagramId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemFlowStep_flowId_stepOrder_key" ON "SystemFlowStep"("flowId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_slug_key" ON "InterviewQuestion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_question_key_key" ON "InterviewQuestion"("question_key");

-- CreateIndex
CREATE INDEX "InterviewQuestion_category_idx" ON "InterviewQuestion"("category");

-- CreateIndex
CREATE INDEX "InterviewQuestion_parent_id_idx" ON "InterviewQuestion"("parent_id");

-- CreateIndex
CREATE INDEX "InterviewQuestion_tags_idx" ON "InterviewQuestion" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "InterviewQuestion_difficulty_idx" ON "InterviewQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "InterviewQuestionKnowledgeLink_question_id_idx" ON "InterviewQuestionKnowledgeLink"("question_id");

-- CreateIndex
CREATE INDEX "InterviewQuestionKnowledgeLink_resource_type_resource_slug_idx" ON "InterviewQuestionKnowledgeLink"("resource_type", "resource_slug");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestionKnowledgeLink_question_id_resource_type_re_key" ON "InterviewQuestionKnowledgeLink"("question_id", "resource_type", "resource_slug");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

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

-- AddForeignKey
ALTER TABLE "DiagramCollaborator" ADD CONSTRAINT "DiagramCollaborator_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramCollaborator" ADD CONSTRAINT "DiagramCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTag" ADD CONSTRAINT "DocumentTag_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTag" ADD CONSTRAINT "DocumentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramFavorite" ADD CONSTRAINT "DiagramFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramFavorite" ADD CONSTRAINT "DiagramFavorite_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityBucket" ADD CONSTRAINT "UserActivityBucket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentViewBucket" ADD CONSTRAINT "DocumentViewBucket_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestionKnowledgeLink" ADD CONSTRAINT "InterviewQuestionKnowledgeLink_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

