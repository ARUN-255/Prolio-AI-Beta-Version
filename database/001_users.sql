CREATE TABLE users(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL ,
    role VARCHAR(20) CHECK (role IN ('students','hr')) NOT NULL,
    unique_id VARCHAR(50) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    plan VARCHAR(10) DEFAULT 'free'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);