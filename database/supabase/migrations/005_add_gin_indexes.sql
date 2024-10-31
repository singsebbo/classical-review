CREATE INDEX
IF NOT EXISTS idx_composer_name ON composers USING GIN
(to_tsvector
('english', name));
CREATE INDEX
IF NOT EXISTS idx_composition_title ON compositions USING GIN
(to_tsvector
('english', title));
