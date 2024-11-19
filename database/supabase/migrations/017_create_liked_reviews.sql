CREATE TABLE IF NOT EXISTS liked_reviews (
  user_id uuid,
  review_id uuid,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, review_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
);