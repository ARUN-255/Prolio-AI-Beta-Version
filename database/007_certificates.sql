CREATE TABLE certificates(
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
student_id UUID REFERENCES students(id) ON DELETE CASCADE,
title VARCHAR(200) NOT NULL,
issuer VARCHAR(150),
issuer_date DATE,
file_url VARCHAR(255),
type VARCHAR(20) CHECK (type IN('certificate','award')) DEFAULT 'certificate',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);