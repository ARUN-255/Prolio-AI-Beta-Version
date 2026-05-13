const pool = require('../config/db');

function createProfile(req,res){
    const user_id = req.body.user_id;
    const name = req.body.name;
    const bio = req.body.bio;
    const skills = req.body.skills;
    const github_url = req.body.github_url;
    const linkedin_url = req.body.linkedin_url;

    if(!user_id || !name){
        return res.status(400).json({message:'User ID and name are required'});
    }

    const query = 'INSERT INTO students(user_id,name,bio,skills,github_url,linkedin_url)VALUES($1,$2,$3,$4,$5,$6) RETURNING*';
    const values = [user_id,name,bio,skills,github_url,linkedin_url];

    pool.query(query,values,function(err,result){
        if(err){
            return res.status(500).json({message:'Error creating profile'});
        }
        return res.status(201).json({message:'Profile created successfully',profile:result.rows[0]});
    });
}

function getProfile(req,res){
    const user_id = req.params.user_id;

    pool.query('SELECT * FROM students WHERE user_id = $1',[user_id],function(err,result){
        if(err){
            return res.status(500).json({message:'Server error'});
        }
        if(result.rows.length===0){
            return res.status(404).json({message:'Profile not found'});
        }
        return res.status(200).json({profile:result.rows[0]});
    });
}

module.exports.createProfile = createProfile;
module.exports.getProfile = getProfile;