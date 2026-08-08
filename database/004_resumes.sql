CREATE TABLE resumes (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
student_id UUID REFERENCES students(id) ON DELETE CASCADE,
template_id VARCHAR(50),
content JSONB,
pdf_url VARCHAR(255),
ats_score INTEGER DEFAULT 0,
is_public BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);