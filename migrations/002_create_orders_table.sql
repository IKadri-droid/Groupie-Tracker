CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    concert_id INTEGER, 
    amount DECIMAL (10,2)NOT NULL,
    status TEXT DEFAULT 'pending',
    stripe_session_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);  