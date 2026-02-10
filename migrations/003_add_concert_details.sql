CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    genre TEXT,
    date_last_album INTEGER,
    image_url TEXT,
    color TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concerts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_concert TEXT,
    venue TEXT,
    price TEXT,
    available_seats INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE concerts ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 0;