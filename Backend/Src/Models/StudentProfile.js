const pool = require("../Config/db");

const StudentProfile = {
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT *
       FROM student_profiles
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  },

  async create({
    userId,
    headline,
    bio,
    location,
    website,
    linkedin,
    github,
  }) {
    console.log("MODEL USER ID:", userId);

    const result = await pool.query(
      `INSERT INTO student_profiles
       (
         user_id,
         headline,
         bio,
         location,
         website,
         linkedin,
         github
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        headline || null,
        bio || null,
        location || null,
        website || null,
        linkedin || null,
        github || null,
      ]
    );

    return result.rows[0];
  },

  async update({
    userId,
    headline,
    bio,
    location,
    website,
    linkedin,
    github,
  }) {
    const result = await pool.query(
      `UPDATE student_profiles
       SET
         headline = $1,
         bio = $2,
         location = $3,
         website = $4,
         linkedin = $5,
         github = $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING *`,
      [
        headline || null,
        bio || null,
        location || null,
        website || null,
        linkedin || null,
        github || null,
        userId,
      ]
    );

    return result.rows[0];
  },
};

module.exports = StudentProfile;