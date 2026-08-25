const pool = require("../Config/db");

const Experience = {
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT *
       FROM experiences
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );

    return result.rows;
  },

  async findByIdAndUserId(id, userId) {
    const result = await pool.query(
      `SELECT *
       FROM experiences
       WHERE id = $1
       AND user_id = $2`,
      [id, userId]
    );

    return result.rows[0];
  },

  async create({
    userId,
    company,
    role,
    description,
    startDate,
    endDate,
    isCurrent,
    isPublic,
  }) {
    const result = await pool.query(
      `INSERT INTO experiences (
        user_id,
        company,
        role,
        description,
        start_date,
        end_date,
        is_current,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        company,
        role,
        description || null,
        startDate || null,
        endDate || null,
        isCurrent ?? false,
        isPublic ?? true,
      ]
    );

    return result.rows[0];
  },

  async update({
    id,
    userId,
    company,
    role,
    description,
    startDate,
    endDate,
    isCurrent,
    isPublic,
  }) {
    const result = await pool.query(
      `UPDATE experiences
       SET
         company = $1,
         role = $2,
         description = $3,
         start_date = $4,
         end_date = $5,
         is_current = $6,
         is_public = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       AND user_id = $9
       RETURNING *`,
      [
        company,
        role,
        description || null,
        startDate || null,
        endDate || null,
        isCurrent ?? false,
        isPublic ?? true,
        id,
        userId,
      ]
    );

    return result.rows[0];
  },

  async delete(id, userId) {
    const result = await pool.query(
      `DELETE FROM experiences
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  },
};

module.exports = Experience;