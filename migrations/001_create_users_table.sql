CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,              -- SERIAL = nombre qui augmente tout seul (1, 2, 3...)
    email TEXT UNIQUE NOT NULL,         -- UNIQUE = pas deux fois le même mail
    username TEXT,                      -- Le pseudo
    password TEXT NOT NULL,             -- On stockera le hash ici (c'est du texte)
    created_at TIMESTAMP DEFAULT NOW()  -- La date de création, remplie automatiquement à "maintenant"
);