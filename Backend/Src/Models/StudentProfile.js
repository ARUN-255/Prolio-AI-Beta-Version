const pool = require("../Config/db");
const StudentProfile = {
  async findByUserId(userId){
    const result = await pool.query(
      `SELECT * FROM student_profiles WHERE user_id = $1`,[userId]
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
    education,
    skills,
    socialLinks,
    IsPublic,
  }){
    const result = await pool.query(
      `INSERT INTO student_profiles(
      user_id,
      headline,
      bio,
      location,
      website,
      linkedIn,
      github,
      education,
      skills,
      social_links,
      is_public
      VALUES ($1,$2,$3,$4.$5,$6,$7,$8,$9,$10,%11) RETURNING*`,
      [
        userId,
        headline || null,
        bio || null,
        location || null,
        website || null,
        linkedin || null,
        github || null,
        education || [],
        skills || [],
        socialLinks || {},
        IsPublic ?? false,
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
  education,
  skills,
  socialLinks,
  isPublic,
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
       education = $7,
       skills = $8,
       social_links = $9,
       is_public = $10,
       updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $11
     RETURNING *`,
    [
      headline || null,
      bio || null,
      location || null,
      website || null,
      linkedin || null,
      github || null,
      JSON.stringify(education || []),
      skills || [],
      JSON.stringify(socialLinks || {}),
      isPublic ?? false,
      userId,
    ]
  );

  return result.rows[0];
},
};

module.exports = StudentProfile;