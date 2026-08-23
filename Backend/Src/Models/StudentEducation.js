const pool = require("../Config/db");
const StudentEducation = {
    async findByUserId(userId){
        const result = await pool.query(
            `SELECT * FROM student_education WHERE user_id = $1 ORDER BY start_year DESC, id DESC`,[userId]
        );
        return result.rows;
    },
    async findByIdAndUserId(id, userId){
        const result = await pool.query(
            `SELECT * FROM student_education WHERE id = $1 AND user_id = $2`,[id, userId]
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
    }){
        const result = await pool.query(
            `INSERT INTO student_education(
            user_id,
            institution,
            degree,
            field_of_study,
            start_year,
            end_year,
            grade,
            description
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING*`,
            [
                userId,
                institution,
                degree,
                fieldOfStudy || null,
                startYear || null,
                endYear || null,
                grade || null,
                description || null,
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
    }){
        const result = await pool.query(
            `UPDATE student_education
            SET
            istitution = $1,
            degree = $2,
            field_of_study = $3,
            start_year = $4
            end_year = $5,
            grade = $6,
            description = $7,
            updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND user_id = $9
            RETURNING*`,
            [
                institution,
                degree,
                fieldOfStudy || null,
                startYear || null,
                endYear || null,
                grade || null,
                description || null,
                id,
                userId,
            ]
        );
        return result.rows[0];
    },
    async delete(id, userId){
        const result = await pool.query(
            `DELETE FROM student_education WHERE id = 1$ AND user_id = $2 RETURNING*`,[id, userId]
        );
        return result.rows[0];
    },
};

module.exports = StudentEducation;