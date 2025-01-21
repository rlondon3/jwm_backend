CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        age INTEGER,
        city VARCHAR(75) NOT NULL,
        country VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        martial_art VARCHAR(255),
        username VARCHAR(255) UNIQUE NOT NULL, 
        password VARCHAR(100) NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE, 
        subscription_start TIMESTAMP,
        subscription_end TIMESTAMP,
        progress INTEGER DEFAULT 0,
        active BOOLEAN,
        subscription_tier INTEGER   
);