const Project = require("../../Models/Project");
const getProjects = async (req,res) => {
    try{
        const projects = await Project.findAllByUserId(req.user.id);
        return res.status(200).json({
            success:true,
            projects,
        });
    }
    catch(error){
        console.error("GET PROJECTS ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

const createProject = async(req,res) => {
    try{
        const{
            title,
            description,
            tech_stack,
            link,
            is_public,
        } = req.body;
        if(!title){
            return res.status(400).json({
                success:false,
                message:"Project title is required",
            });
        }
        const project = await Project.create({
            userId:req.user.id,
            title,
            description,
            techStack: tech_stack,
            link,
            isPublic: is_public,
        });
        return res.status(201).json(
            {
                success:true,
                message:"Project created successfully",project,
            });
    }catch(error){
        console.error("CREATE PROJECT ERROR:",error);
        return res.status(500),json({
            success:false,
            message:"Internal server error",
        });
    }
};

const updateProject = async (req,res) => {
    try{
        const projectId = req.params.id;
        const existingProject = await Project.findByIdAndUserId(
            projectId,
            req.user.id
        );
        if(!existingProject){
            return res.status(404).json({
                success:false,
                message:"Project not found",
             });
        }
        const {
            title,
            description,
            tech_stack,
            link,
            is_public
        } = req.body;
        if(!title){
            return res.status(400).json({
                success:false,
                message:"Project title is required",
            });
        }
        const project = await Project.update({
            id:projectId,
            userId:req.user.id,
            title,
            description,
            techStack: tech_stack,
            link,
            isPublic: is_public,
        });
        return res.status(200).json({
            success:true,
            message:"Project updated successfully",project,
        });
    }
    catch(error){
        console.error("UPDATE PROJECT ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

const deleteProject = async(req,res) => {
    try{
        const projectId = req.params.id;
        const project = await Project.delete(
            projectId,
            req.user.id
        );
        if(!project){
            return res.status(404).json({
                success:false,
                mesage:"Project not found",
            });
        }
        return res.status(204).send();
    }
    catch(error) {
        console.error("DELETE PROJECT ERROR:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
};