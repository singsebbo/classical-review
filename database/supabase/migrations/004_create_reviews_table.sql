CREATE TABLE
IF NOT EXISTS reviews
(
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  composition_id uuid,
  user_id uuid,
  rating INT CHECK
(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY
(composition_id) REFERENCES compositions
(composition_id) ON
DELETE CASCADE,
  FOREIGN KEY (user_id)
REFERENCES users
(user_id) ON
DELETE CASCADE
);
