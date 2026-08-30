const pool = require("../Config/db");

const Resume = {
  // GET ALL RESUMES FOR LOGGED-IN USER
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT *
       FROM resumes
       WHERE user_id = $1
       ORDER BY is_primary DESC, updated_at DESC`,
      [userId]
    );

    return result.rows;
  },

  // GET ONE RESUME OWNED BY USER
  async findByIdAndUserId(id, userId) {
    const result = await pool.query(
      `SELECT *
       FROM resumes
       WHERE id = $1
       AND user_id = $2`,
      [id, userId]
    );

    return result.rows[0];
  },

  // CREATE RESUME
  async create({
    userId,
    title,
    templateName,
    resumeData,
    isPrimary,
    isPublic,
  }) {
    const result = await pool.query(
      `INSERT INTO resumes (
        user_id,
        title,
        template_name,
        resume_data,
        is_primary,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userId,
        title,
        templateName || "classic",
        resumeData || {},
        isPrimary ?? false,
        isPublic ?? false,
      ]
    );

    return result.rows[0];
  },

  // UPDATE RESUME
  async update({
    id,
    userId,
    title,
    templateName,
    resumeData,
    isPrimary,
    isPublic,
  }) {
    const result = await pool.query(
      `UPDATE resumes
       SET
         title = $1,
         template_name = $2,
         resume_data = $3,
         is_primary = $4,
         is_public = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       AND user_id = $7
       RETURNING *`,
      [
        title,
        templateName || "classic",
        resumeData || {},
        isPrimary ?? false,
        isPublic ?? false,
        id,
        userId,
      ]
    );

    return result.rows[0];
  },

  // DELETE RESUME
  async delete(id, userId) {
    const result = await pool.query(
      `DELETE FROM resumes
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  },

  // UPDATE COMPLETE RESUME DATA
async updateResumeData(id, userId, resumeData) {
  const result = await pool.query(
    `UPDATE resumes
     SET resume_data = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     AND user_id = $3
     RETURNING *`,
    [resumeData || {}, id, userId]
  );

  return result.rows[0];
},

// UPDATE OR CREATE ONE RESUME SECTION
async updateSection(id, userId, sectionName, sectionData) {
  const result = await pool.query(
    `UPDATE resumes
     SET resume_data = jsonb_set(
       COALESCE(resume_data, '{}'::jsonb),
       ARRAY[$3]::text[],
       $4::jsonb,
       true
     ),
     updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      sectionName,
      JSON.stringify(sectionData)
    ]
  );

  return result.rows[0];
},

// DELETE ONE RESUME SECTION
async deleteSection(id, userId, sectionName) {
  const result = await pool.query(
    `UPDATE resumes
     SET resume_data = resume_data - $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     AND user_id = $2
     RETURNING *`,
    [id, userId, sectionName]
  );

  return result.rows[0];
},

// UPDATE GENERATED PDF URL
async updatePdfUrl(id, userId, pdfUrl) {
  const result = await pool.query(
    `UPDATE resumes
     SET pdf_url = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     AND user_id = $3
     RETURNING *`,
    [pdfUrl, id, userId]
  );

  return result.rows[0];
},

  // REMOVE PRIMARY FLAG FROM OTHER RESUMES
  async clearPrimary(userId, excludeId = null) {
    if (excludeId) {
      await pool.query(
        `UPDATE resumes
         SET is_primary = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         AND id != $2`,
        [userId, excludeId]
      );
    } else {
      await pool.query(
        `UPDATE resumes
         SET is_primary = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );
    }
  },
};

module.exports = Resume;