CREATE TABLE IF NOT EXISTS conversions (
  id SERIAL PRIMARY KEY,
  session_id UUID,
  input_text TEXT,
  output_text TEXT,
  mode VARCHAR(50),
  char_count INT,
  word_count INT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stats (
  date DATE PRIMARY KEY,
  total_conversions INT DEFAULT 0,
  total_characters INT DEFAULT 0
);