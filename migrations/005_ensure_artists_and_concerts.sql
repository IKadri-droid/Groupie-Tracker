CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    genre TEXT,
    date_last_album INTEGER,
    image_url TEXT,
    color TEXT
);

CREATE TABLE IF NOT EXISTS concerts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    location TEXT,
    date TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='artists' AND COLUMN_NAME='image_url') THEN
        ALTER TABLE artists ADD COLUMN image_url TEXT;
    END IF;
END $$;
