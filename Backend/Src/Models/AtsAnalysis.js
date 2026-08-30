const pool = require("../Config/db");


// CREATE ATS ANALYSIS
const create = async ({
  userId,
  resumeId,
  jobTitle,
  jobDescription,
  atsScore,
  matchedKeywords,
  missingKeywords,
  matchedSkills,
  missingSkills,
  strengths,
  improvements,
  aiFeedback,
}) => {
  const query = `
    INSERT INTO ats_analyses (
      user_id,
      resume_id,
      job_title,
      job_description,
      ats_score,
      matched_keywords,
      missing_keywords,
      matched_skills,
      missing_skills,
      strengths,
      improvements,
      ai_feedback
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6::jsonb,
      $7::jsonb,
      $8::jsonb,
      $9::jsonb,
      $10::jsonb,
      $11::jsonb,
      $12::jsonb
    )
    RETURNING *
  `;

  const values = [
    userId,
    resumeId,
    jobTitle || null,
    jobDescription,
    atsScore ?? null,
    JSON.stringify(matchedKeywords || []),
    JSON.stringify(missingKeywords || []),
    JSON.stringify(matchedSkills || []),
    JSON.stringify(missingSkills || []),
    JSON.stringify(strengths || []),
    JSON.stringify(improvements || []),
    aiFeedback
  ? JSON.stringify(aiFeedback)
  : null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};


// GET ALL ATS ANALYSES FOR USER
const findAllByUserId = async (userId) => {
  const query = `
    SELECT *
    FROM ats_analyses
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};


// GET ONE ATS ANALYSIS
const findByIdAndUserId = async (
  id,
  userId
) => {
  const query = `
    SELECT *
    FROM ats_analyses
    WHERE id = $1
      AND user_id = $2
    LIMIT 1
  `;

  const result = await pool.query(
    query,
    [id, userId]
  );

  return result.rows[0] || null;
};


// DELETE ATS ANALYSIS
const deleteByIdAndUserId = async (
  id,
  userId
) => {
  const query = `
    DELETE FROM ats_analyses
    WHERE id = $1
      AND user_id = $2
    RETURNING *
  `;

  const result = await pool.query(
    query,
    [id, userId]
  );

  return result.rows[0] || null;
};


module.exports = {
  create,
  findAllByUserId,
  findByIdAndUserId,
  deleteByIdAndUserId,
};