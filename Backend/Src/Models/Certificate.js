const pool = require("../Config/db");

const Certificate = {
  // GET ALL CERTIFICATES FOR THE LOGGED-IN STUDENT
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT *
       FROM certificates
       WHERE user_id = $1
       ORDER BY date DESC NULLS LAST, created_at DESC`,
      [userId]
    );

    return result.rows;
  },

  // GET ONE CERTIFICATE OWNED BY THIS USER
  async findByIdAndUserId(id, userId) {
    const result = await pool.query(
      `SELECT *
       FROM certificates
       WHERE id = $1
       AND user_id = $2`,
      [id, userId]
    );

    return result.rows[0];
  },

  // CREATE CERTIFICATE
  async create({
    userId,
    title,
    issuer,
    date,
    fileUrl,
    isPublic,
  }) {
    const result = await pool.query(
      `INSERT INTO certificates (
        user_id,
        title,
        issuer,
        date,
        file_url,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userId,
        title,
        issuer || null,
        date || null,
        fileUrl || null,
        isPublic ?? true,
      ]
    );

    return result.rows[0];
  },

  // UPDATE CERTIFICATE
  async update({
    id,
    userId,
    title,
    issuer,
    date,
    fileUrl,
    isPublic,
  }) {
    const result = await pool.query(
      `UPDATE certificates
       SET
         title = $1,
         issuer = $2,
         date = $3,
         file_url = $4,
         is_public = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       AND user_id = $7
       RETURNING *`,
      [
        title,
        issuer || null,
        date || null,
        fileUrl || null,
        isPublic ?? true,
        id,
        userId,
      ]
    );

    return result.rows[0];
  },

  // DELETE CERTIFICATE
  async delete(id, userId) {
    const result = await pool.query(
      `DELETE FROM certificates
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  },
};

module.exports = Certificate;