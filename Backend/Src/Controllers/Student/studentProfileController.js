const StudentProfile = require("../../Models/StudentProfile");
const getProfile = async (req,res) => {
  try{
    const profile = await StudentProfile.findByUserId(req.user.id);
    if(!profile){
      return res.status(404),json({
        success: false,
        message: "Student profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      profile,
    });
  }
  catch(error){
    console.error("GET STUDENT PROFILE ERROR:",error);
    return res.status(500).json({
      success:false,
      message:"Internal server error",
    });
  }
};

const createProfile = async (req,res) => {
  try{
    const userId = req.user.id;
    const existingProfile = await StudentProfile.findByUserId(userId);
    if(existingProfile){
      return res.status(409).json({
        success:false,
        message:"Student profile already exists",
      });
    }
    const {
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
    } = req.body;

    const profile = await StudentProfile.create({
      userId,
      headline,
      bio,
      location,
      linkedin,
      github,
      education,
      skills,
      socialLinks,
      isPublic,
    });

    return res.status(201).json({
      success:true,
      message:"Student profile created successfully",
      profile,
    });
  }catch(error){
    console.error("CREATE STUDENT PROFILE ERROR:",error);
    return res.status(500).json({
      success:false,
      message:"Internal server error",
    });
  }
};

const updateProfile = async (req,res) => {
  try{
    const userId = req.user.id;
    const existingProfile = await StudentProfile.findByUserId(userId);
    if(!existingProfile){
      return res.status(404).json({
        success:false,
        message:"Student profile not found",
      });
    }
    const {
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
    } = req.body;

    const profile = await StudentProfile.update({
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
    });
    return res.status(200).json({
      success:true,
      message:"Student profile updated successfully",profile,
    });
  }catch(error){
    console.error("UPDATE STUDENT PROFILE ERROR:",error);
    return res.status(500).json({
      success:false,
      message:"Internal server error",
    });
  }
};

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
};