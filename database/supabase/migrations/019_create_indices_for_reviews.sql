CREATE INDEX IF NOT EXISTS idx_reviews_composition_id ON reviews(composition_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_composition_user ON reviews(composition_id, user_id);
