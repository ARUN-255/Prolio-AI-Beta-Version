const pool = require("../Config/db");
const Project = {
    async findAllByUserId(userId){
        const result = await pool.query(
            `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,[userId]
        );
        return result.rows;
    },
    async findByIdAndUserId(id, userId){
        const result = await pool.query(
            `SELECT * FROM projects WHERE id = $1 and user_id = $2`,[id, userId]
        );
        return result.rows[0];
    },
    async create({
        userId,
        title,
        description,
        techStack,
        link,
        isPublic,
    }){
        const result = await pool.query(
            `INSERT INTO projects
            (
            user_id,
            title,
            description,
            tech_stack,
            link,
            is_public
            )
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [
                userId,
                title,
                description || null ,
                techStack || null ,
                link || null ,
                isPublic ?? true,
            ]
        );
        return result.rows[0];
    },
    async update({
        id,
        userId,
        title,
        description,
        techStack,
        link,
        isPublic,
    }){
        const result = await pool.query(
            `UPDATE projects SET
            title = $1,
            description = $2,
            tech_stack = $3,
            link = $4,
            is_public = $5,
            updated_at=
            CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING*`,
            [
                title,
                description || null,
                techStack || [],
                link || null ,
                isPublic ?? true,
                id,
                userId,
            ]
        );
        return result.rows[0];
    },
    async delete(id, userId){
        const result = await pool.query(
            `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *`,[id, userId]
        );
        return result.rows[0];
    },
};

module.exports = Project;