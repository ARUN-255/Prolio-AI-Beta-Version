const pool = require("../Config/db");

const User = {
  // CREATE USER
  async create({
    name,
    email,
    phone,
    passwordHash,
    role
  }) {
    const query = `
      INSERT INTO users (
        name,
        email,
        phone,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        created_at
    `;

    const values = [
      name,
      email,
      phone,
      passwordHash,
      role
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  },


  // FIND USER BY EMAIL
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0];
  },


  // FIND USER BY PHONE
  async findByPhone(phone) {
    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE phone = $1`,
      [phone]
    );

    return result.rows[0];
  },


  // FIND USER BY EMAIL OR PHONE
  async findByIdentifier(identifier) {
    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE email = $1
       OR phone = $1`,
      [identifier]
    );

    return result.rows[0];
  },


  // FIND USER BY ID
  async findById(id) {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        public_slug,
        created_at,
        updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  },


  // FIND USER BY PUBLIC PORTFOLIO SLUG
  async findBySlug(slug) {
    const result = await pool.query(
      `SELECT
        id,
        name,
        role,
        public_slug
       FROM users
       WHERE public_slug = $1`,
      [slug]
    );

    return result.rows[0];
  },


  // UPDATE PUBLIC PORTFOLIO SLUG
  async updatePublicSlug(userId, slug) {
    const result = await pool.query(
      `UPDATE users
       SET
         public_slug = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING
         id,
         name,
         email,
         phone,
         role,
         public_slug`,
      [
        slug,
        userId
      ]
    );

    return result.rows[0];
  }
};

module.exports = User;