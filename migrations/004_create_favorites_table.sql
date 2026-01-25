CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, artist_id)
);