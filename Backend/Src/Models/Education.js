const pool = require("../Config/db");
const { findAllByUserId, findByIdAndUserId } = require("./Project");
const Education = {
    async findAllByUserId(userId){
        const result = await pool.query(
            `SELECT * FROM education WHERE user_id = $1 ORDER BY end_year DESC NULLS FIRST, start_year DESC`,[userId]
        );
        return result.rows;
    },
    async findByIdAndUserId(id,userId){
        const result = await pool.query(
            `SELECT * FROM education WHERE id = $1 AND user_id = $2`,[id, userId]
        );
        return result.rows[0];
    },
    async create({
        userId,
        institution,
        degree,
        fieldOfStudy,
        startYear,
        endYear,
        grade,
        description,
        isPublic,
    }){
        const result = await pool.query(
            `INSERT INTO education (
            user_id,
            institution,
            degree,
            field_of_study,
            start_year,
            end_year,
            grade,
            description,
            is_public
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING*`,[
                userId,
                institution,
                degree,
                fieldOfStudy || null,
                startYear || null ,
                endYear || null ,
                grade || null ,
                description || null,
                isPublic ?? true,
            ]
        );
        return result.rows[0];
    },
    async update({
        id,
        userId,
        institution,
        degree,
        fieldOfStudy,
        startYear,
        endYear,
        grade,
        description,
        isPublic,
    }){
        const result = await pool.query(
            `UPDATE education SET
            institution = $1,
            degree = $2,
            field_of_study = $3,
            start_year = $4,
            end_year = $5,
            grade = $6,
            description = $7,
            is_public = $8,
            updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND user_id = $10 RETURNING*`,[
                institution,
                degree,
                fieldOfStudy || null ,
                startYear || null ,
                endYear || null ,
                grade || null ,
                description || null ,
                isPublic ?? true ,
                id ,
                userId,
            ]
        );
        return result.rows[0];
    },
    async delete(id, userId){
        const result = await pool.query(
            `DELETE FROM education WHERE id = $1 AND user_id = $2 RETURNING*`,[id, userId]
        );
        return result.rows[0];
    },
};

module.exports = Education;