CREATE TABLE IF NOT EXISTS
users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN('student','recruiter')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK(email IS NOT NULL OR phone IS NOT NULL) 
);

CREATE TABLE IF NOT EXISTS 
student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    headline VARCHAR(150),
    bio TEXT,
    location VARCHAR(150),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS
projects(
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
title VARCHAR(200) NOT NULL,
description TEXT,
tech_stack TEXT[] DEFAULT '{}',
link TEXT,
is_public BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS
updated_at TIMESTAMP DEFAULT
CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS
experiences(
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
company VARCHAR(200) NOT NULL,
role VARCHAR(200) NOT NULL,
description TEXT,
start_date DATE,
end_date DATE,
is_current BOOLEAN DEFAULT FALSE,
is_public BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_experiences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 
education(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    start_year INTEGER,
    end_year INTEGER,
    grade VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 
skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    proficiency VARCHAR(50),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 
certificates(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    issuer VARCHAR(200),
    date DATE,
    file_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS public_slug VARCHAR(150) UNIQUE;

CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,
    template_name VARCHAR(100) DEFAULT 'classic',

    resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_primary BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resumes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================
-- ATS ANALYSIS
-- ============================================

CREATE TABLE IF NOT EXISTS ats_analyses (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,

    job_title VARCHAR(200),
    job_description TEXT NOT NULL,

    ats_score INTEGER,

    matched_keywords JSONB DEFAULT '[]'::jsonb,
    missing_keywords JSONB DEFAULT '[]'::jsonb,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,

    strengths JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ats_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ats_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_ats_score
        CHECK (
            ats_score IS NULL
            OR (ats_score >= 0 AND ats_score <= 100)
        )
);

ALTER TABLE ats_analyses
ADD COLUMN IF NOT EXISTS ai_feedback JSONB DEFAULT NULL;


CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'recruiter')),
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    billing_cycle VARCHAR(20) CHECK (
        billing_cycle IN ('monthly', 'yearly')
    ),
    auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'expired')),
    razorpay_subscription_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans
(name, role, price_monthly, price_yearly, limits)
VALUES

(
    'Student Free',
    'student',
    0,
    0,
    '{
        "portfolios": 1,
        "resumes_per_month": 3,
        "resume_templates": 6,
        "portfolio_templates": 3,
        "certificates_max": 5,
        "projects_max": 2,
        "chatbot_questions_per_month": 40,
        "chatbot_questions_per_visitor": 5,
        "ats_checks_per_month": 2,
        "resume_watermark": false,
        "portfolio_watermark": true,
        "custom_domain": false,
        "custom_link": false
    }'::jsonb
),

(
    'Student Pro',
    'student',
    89,
    699,
    '{
        "portfolios_per_month": 10,
        "resumes_per_month": 10,
        "resume_templates": "all",
        "portfolio_templates": "all",
        "certificates_max": null,
        "projects_max": null,
        "chatbot_questions_per_month": 300,
        "chatbot_questions_per_visitor": 50,
        "ats_checks_per_month": 10,
        "resume_watermark": false,
        "portfolio_watermark": false,
        "custom_domain": true,
        "custom_link": true
    }'::jsonb
),

(
    'Recruiter Free',
    'recruiter',
    0,
    0,
    '{
        "job_posts_per_month": 3,
        "invitations_per_month": 30,
        "comparison_batch_size": 3,
        "comparisons_per_day": 10,
        "resume_downloads_per_month": 30
    }'::jsonb
),

(
    'Recruiter Pro',
    'recruiter',
    149,
    999,
    '{
        "job_posts_per_month": null,
        "invitations_per_month": null,
        "comparison_batch_size": 10,
        "comparisons_per_month": 300,
        "resume_downloads_per_month": 100
    }'::jsonb
),

(
    'Recruiter Enterprise',
    'recruiter',
    3999,
    NULL,
    '{
        "job_posts_per_month": null,
        "invitations_per_month": null,
        "comparison_batch_size": null,
        "comparisons_per_month": null,
        "resume_downloads_per_month": null
    }'::jsonb
)

ON CONFLICT (name) DO NOTHING;