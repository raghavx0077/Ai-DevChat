const Project = require("../models/project.model.js");
const projectService = require("../services/project.service.js");
const { validationResult } = require("express-validator");
const userModel = require("../models/usermodel.js");

const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    // console.log("req.user:", req.user);
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    // console.log("userId:", userId);

    const newProject = await projectService.createProject({ name, userId });
    // console.log("New Project:", newProject);
    res.status(201).send(newProject);
  } catch (error) {
    console.log("Error in createProject:", error);
    res.status(400).send(error.message);
  }
};
const getAllProjects = async (req, res) => {
  try {
    const loggedInUser=await userModel.findOne({email:req.user.email});
    const allUserProjects=await projectService.getAllProjects({
        userId:loggedInUser._id
    })
 
    // console.log('user:',loggedInUser);
    // console.log('allUserProjects',allUserProjects);
    
    return res.status(200).json({projects: allUserProjects})
  
} catch (err) {
    console.log("Error in getAllProjects:", err);
    res.status(404).json({ message: err.message });
  }
};
const addUserToProject =async(req,res)=>{
    const errors =validationResult(req);

    if(!errors.isEmpty)

        {
            return res.status(400).json({errors: errors.array()});
        }
        try{
            const {projectId,users}=req.body;
            // console.log('body:',req.body);

            const loggedInUser=await userModel.findOne({email:req.user.email});
            const  project=await projectService.addUserToProject({
                projectId,
                users,
                userId:loggedInUser._id
            })
            // console.log('projectId:',projectId);
            // console.log('project:',project);
            return res.status(200).json({project});
        }catch(err)
        {
          console.log('err',err);
          res.status(400).json({error:err.message});  
        }
}

const getProjectById=async(req,res)=>{
  const {projectId}=req.params;
  try{
    const project =await projectService.getProjectsById(projectId);
    return res.status(200).json({project});
  }catch(error){
    console.log('Error in getProjectById:',error);
    return res.status(400).json({error:error.message});
  }
}

const updateFileTree=async (req,res)=>{

  console.log("Request body:", req.body);

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  
  try{
    const {projectId,fileTree}=req.body;

    const project =await projectService.updateFileTree({
      projectId,
      fileTree
    }) 

    return res.status(200).json({project})

  }
  catch(err){
    console.log(err)
    res.status(400).json({error:err.message})
  }
}
module.exports = { createProject, getAllProjects ,addUserToProject,getProjectById,updateFileTree};
