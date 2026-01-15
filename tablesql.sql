-- Table des artistes
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    formation_year INTEGER,
    image_url TEXT,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des membres
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- vocalist, guitarist, drummer, etc.
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des localisations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city, country)
);

-- Table des concerts/dates
CREATE TABLE concerts (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    concert_date DATE NOT NULL,
    venue VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_concert UNIQUE(artist_id, location_id, concert_date)
);

-- Table des relations entre artistes (collaborations)
CREATE TABLE artist_relations (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    related_artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    relation_type VARCHAR(50), -- collaboration, influence, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_relation CHECK (artist_id != related_artist_id),
    CONSTRAINT unique_relation UNIQUE(artist_id, related_artist_id, relation_type)
);

-- Index pour performances
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_members_artist ON members(artist_id);
CREATE INDEX idx_concerts_artist ON concerts(artist_id);
CREATE INDEX idx_concerts_location ON concerts(location_id);
CREATE INDEX idx_concerts_date ON concerts(concert_date);
CREATE INDEX idx_locations_city ON locations(city);