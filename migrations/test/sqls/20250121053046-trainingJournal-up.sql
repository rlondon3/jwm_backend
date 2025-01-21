CREATE TABLE IF NOT EXISTS training_entries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    practice_date DATE,
    practice_type VARCHAR(50), 
    session_duration INT,
    content TEXT,
    reflection TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
