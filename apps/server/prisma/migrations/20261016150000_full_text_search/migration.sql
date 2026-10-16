-- Tam metin arama ve yazım toleransı için eklenti.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Doküman: başlık (A) ve içerik (B) ağırlıklı arama vektörü.
-- 'simple' sözlüğü Türkçe ve İngilizce metinde dil bağımsız çalışır.
ALTER TABLE "Document"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("content", '')), 'B')
  ) STORED;

CREATE INDEX "Document_searchVector_idx" ON "Document" USING GIN ("searchVector");
CREATE INDEX "Document_title_trgm_idx" ON "Document" USING GIN ("title" gin_trgm_ops);

-- Diyagram: başlık üzerinden arama vektörü.
ALTER TABLE "Diagram"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce("title", ''))) STORED;

CREATE INDEX "Diagram_searchVector_idx" ON "Diagram" USING GIN ("searchVector");
CREATE INDEX "Diagram_title_trgm_idx" ON "Diagram" USING GIN ("title" gin_trgm_ops);
