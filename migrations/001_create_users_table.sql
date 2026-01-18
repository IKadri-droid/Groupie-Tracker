CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,              -- SERIAL = nombre qui augmente tout seul (1, 2, 3...)
    email TEXT UNIQUE NOT NULL,         -- UNIQUE = pas deux fois le même mail
    username TEXT,                      -- Le pseudo
    password TEXT NOT NULL,             -- On stockera le hash ici (c'est du texte)
    created_at TIMESTAMP DEFAULT NOW(), -- Virgule ici pour passer à la suite
    role TEXT DEFAULT 'user'            -- Pas de virgule ici, c'est le dernier ingrédient
);

UPDATE users SET role = 'admin' WHERE email = 'AdminGroupie@groupie.com';