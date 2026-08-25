const pool = require("../Config/db");
const Skill = {
    async findAllByUserId(userId){
        const result = await pool.query(
            `SELECT * FROM skills WHERE user_id = $1 ORDER BY category ASC NULLS LAST, name ASC`,[userId]
        );
        return result.rows;
    },
    async findByIdAndUserId(id, userId){
        const result= await pool.query(
            `SELECT * FROM skills WHERE id = $1 AND user_id = $2`,[id, userId]
        );
        return result.rows[0];
    },
    async create({
        userId,
        name,
        category,
        proficiency,
        isPublic,
    }){
        const result = await pool.query(
            `INSERT INTO skills (
            user_id,
            name,
            category,
            proficiency,
            is_public)
            VALUES($1,$2,$3,$4,$5) RETURNING*`,
            [
                userId,
                name,
                category || null ,
                proficiency || null,
                isPublic ?? true,
            ]
        );
        return result.rows[0];
    },
    async update({
        id,
        userId,
        name,
        category,
        proficiency,
        isPublic,
    }){
        const result = await pool.query(
            `UPDATE skills SET
            name = $1,
            category = $2,
            proficiency = $3,
            is_public = $4,
            updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id=$6 RETURNING*`,
            [
                name,
                category || null,
                proficiency || null,
                isPublic ?? true,
                id,
                userId,
            ]
        );
        return result.rows[0];
    },
    async delete(id,userId){
        const result = await pool.query(
            `DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING*`,[id,userId]
        );
        return result.rows[0];
    },
};

module.exports = Skill;