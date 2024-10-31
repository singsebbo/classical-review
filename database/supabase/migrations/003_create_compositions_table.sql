CREATE TABLE
IF NOT EXISTS compositions
(
  composition_id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  composer_id uuid,
  title VARCHAR
(255) NOT NULL,
  genre VARCHAR
(100),
  FOREIGN KEY
(composer_id) REFERENCES composers
(composer_id) ON
DELETE
SET NULL
);
