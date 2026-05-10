CREATE TABLE jobs(
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
recruiter_id UUID REFERENCES recruiters(id)  ON DELETE CASCADE,
title VARCHAR(150) NOT NULL ,
description TEXT,
required_skills TEXT[],
location VARCHAR(100),
salary_range VARCHAR(50),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);