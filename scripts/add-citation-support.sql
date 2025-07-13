-- Add Citation support to the database
-- This script adds citation relationships between papers

-- Create Citations table
CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  citing_paper_id TEXT NOT NULL,
  cited_paper_id TEXT NOT NULL,
  citation_text TEXT,
  citation_context TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (citing_paper_id) REFERENCES papers(id) ON DELETE CASCADE,
  FOREIGN KEY (cited_paper_id) REFERENCES papers(id) ON DELETE CASCADE,
  
  -- Ensure unique citations
  UNIQUE(citing_paper_id, cited_paper_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_citations_citing_paper ON citations(citing_paper_id);
CREATE INDEX IF NOT EXISTS idx_citations_cited_paper ON citations(cited_paper_id);
CREATE INDEX IF NOT EXISTS idx_citations_verified ON citations(verified);

-- Add citation count columns to papers table if they don't exist
ALTER TABLE papers ADD COLUMN IF NOT EXISTS citation_count INTEGER DEFAULT 0;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS cited_by_count INTEGER DEFAULT 0;

-- Create a view for citation network analysis
CREATE VIEW IF NOT EXISTS citation_network AS
SELECT 
  p1.id as citing_id,
  p1.title as citing_title,
  p2.id as cited_id,
  p2.title as cited_title,
  c.citation_text,
  c.verified
FROM citations c
JOIN papers p1 ON c.citing_paper_id = p1.id
JOIN papers p2 ON c.cited_paper_id = p2.id;