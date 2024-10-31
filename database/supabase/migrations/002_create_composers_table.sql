CREATE TABLE
IF NOT EXISTS composers
(
  composer_id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  name VARCHAR
(100) NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  image_url VARCHAR
(255)
);
