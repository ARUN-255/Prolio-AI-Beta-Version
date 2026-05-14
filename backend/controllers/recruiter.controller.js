const pool = require('../config/db');

function createProfile(req,res){
    const user_id = req.body.user_id;
    const company_name = req.body.company_name;
    const industry = req.body.industry;
    const location = req.body.location;
    const hr_name = req.body.hr_name;

    if(!user_id || !company_name){
        return res.status(400).json({message:'user ID and company name are required'});
    }

    const query = 'INSERT INTO recruiters (user_id,company_name.industry,location,hr_name) VALUES ($1,$2,$3,$4,$5) RETURNING*';
    const values = [user_id,company_name,industry,location,hr_name];

    pool.query(query,values,function(err,result){
        if(err){
            return res.status(500).json({message:'Error creating recruiter profile'});
        }
        return res.status(201).json({message:'recruiter profile created',profile:result.rows[0]});
    });
}

function getProfile(req,res){
    const user_id = req.params.user_id;

    pool.query('SELECT * FROM recruiters WHERE user_id = $1', [user_id],function(err,result){
        if(err){
            return res.status(500).json({message:'server error'});
        }
        if(result.rows.length ===0){
            return res.status(404).json({message:'recruiter profile not found'});
        }
        return res.status(200).json({profile:result.rows[0]});
    });
}

function postJob(req,res){
    const recruiter_id = req.body.recruiter_id;
    const title = req.body.title;
    const description = req.body.description;
    const required_skills = req.body.location;
    const salary_range = req.body.salary_range;

    if(!recruiter_id || !title){
        return res.status(400).json({message:'Recruiter ID and title are required'});
    }

    const query = 'INSERT INTO jobs(recruiter_id,title,description,required_skills,location,salary_range) VALUES($1,$2.$3,$4,$5,$6) RETURNING*';
    const values = [recruiter_id,title,description,required_skills,location,salary_range];

    pool.query(query,values,function(err,result){
        if(err){
            return res.status(500).json({message:'Error posting job'});
        }
        return res.status(201).json({message:'Job posted successfully',job:result.rows[0]});
    });
}

module.exports.createProfile = createProfile;
module.exports.getProfile = getProfile;
module.exports.postJob = postJob;