CREATE TABLE students(
    id UUID gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    skills TEXT[],
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    education JSONB,
    projects JSONB,
    social_links JSONB,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);