const pool = require("../Config/db");

const User = {
    async create({
        name, email, phone, passwordHash, role
    })
    {
        const query =`
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id, name, email, phone, role, created_at`;

        const values =[name, email, phone, passwordHash, role];
        const result = await pool.query(query,values);
        return result.rows[0];
    },
    async findByEmail(email){
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,[email]
        );
        return result.rows[0];
    },
    async findByPhone(phone){
        const result = await pool.query(
            `SELECT * FROM users WHERE phone = $1`,[phone]
        );
        return result.rows[0];
    },
    async findByIdentifier(identifier){
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR phone = $1`,[identifier]
        );
        return result.rows[0];
    },
    async findById(id){
        const result = await pool.query(
            `SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1`,[id]
        );
        return result.rows[0];
    }
};

module.exports = User;