const Education = require("../../Models/Education");
const getEducation = async (req,res) => {
    try{
        const education = await Education.findAllByUserId(req.user.id);
        return res.status(200).json({
            success:true,
            education:education,
        });
    }
    catch(error){
        console.error("GET EDUCATION ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

const createEducation = async (req,res) => {
    try{
        const{
            institution,
            degree,
            field_of_study,
            start_year,
            end_year,
            grade,
            description,
            is_public,
        } = req.body;
        if(!institution || !degree){
            return res.status(400).json({
                success:false,
                message:"Institution and degree are required",
            });
        }
        const education = await Education.create({
            userId:req.user.id,
            institution,
            degree,
            fieldOfStudy: field_of_study,
            startYear: start_year,
            endYear: end_year,
            grade,
            description,
            isPublic: is_public,
        });
        return res.status(201).json({
            success:true,
            message:"Education created successfully",
        });
    }
    catch(error){
        console.error("CREATE EDUCATION ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

const updateEducation = async (req,res) => {
    try{
        const educationId = req.params.id;
        const existingEducation = await Education.findByIdAndUserId(
            educationId, 
            req.user.id
        );
        if(!existingEducation){
            return res.status(404).json({
                success:false,
                message:"Education record not found",
            });
        }
        const {
            institution,
            degree,
            field_of_study,
            start_year,
            end_year,
            grade,
            description,
            is_public,
        } = req.body;
        if(!institution || !degree){
            return res.status(400).json({
                success:false,
                message:"Institution and degree are required",
            });
        }
        const education = await Education.update({
            id:educationId,
            userId:req.user.id,
            institution,
            degree,
            fieldOfStudy:field_of_study,
            startYear:start_year,
            endYear:end_year,
            grade,
            description,
            isPublic:is_public,
        });
        return res.status(200).json({
            success:true,
            message:"Education updated successfully",education,
        });
    }
    catch(error){
        console.error("UPDATE EDUCATION ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

const deleteEducation = async (req,res) => {
    try{
        const education = await Education.delete(
            req.params.id,
            req.user.id
        );
        if(!education){
            return res.status(404).json({
                success:false,
                message:"Education record not found",
            });
        }
        return res.status(204).send();
    }
    catch(error){
        console.error("DELETE EDUCATION ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

module.exports = {
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation,
};