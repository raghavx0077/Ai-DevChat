const projectmodel = require("../models/project.model.js");
const mongoose = require("mongoose");
const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("name is Required");
  }
  if (!userId) {
    throw new Error("UserId is required");
  }

  try {
    const project = await projectmodel.create({
      name,
      users: [userId],
    });

    return project;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error code in MongoDB
      throw new Error("Project name already exists");
    }
    throw error;
  }
};

const getAllProjects = async ({ userId }) => {
  if (!userId) {
    throw new Error("UserId is required");
  }

  const allUserProjects = await projectmodel.find({
    users: userId,
  });
    // console.log("All User Projects1:", allUserProjects);
  return allUserProjects;
};

const addUserToProject = async ({ projectId, users,userId }) => {

  if (!projectId) {
    {
      throw new Error("Project Id is required");
    }
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project Id is not valid");
  }

  if (!users) {
    throw new Error("User is required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in user array");
  }

  if(!userId){
    throw new Error("userId is required");
  }

  if(!mongoose.Types.ObjectId.isValid(userId)){
    throw new Error("userId is not valid");
  }

  // console.log("ProjectId:", projectId);
  //   console.log("Users:", users);
    console.log("userId:", userId);
  const project =await projectmodel.findOne({
    _id: projectId,
    users:userId,
  })
  if(!project){
    throw new Error("User not belong to project");
  }

  const updatedProject=await projectmodel.findOneAndUpdate({
    _id:projectId},
    {
    $addToSet:{users:{$each:users} }
    },
  {
    new:true
  })
  
    return updatedProject;
};
const getProjectsById = async (projectId) => {
  if (!projectId) {
    throw new Error("Project Id is required");
  }
//  console.log("projectId:",projectId);
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project Id is not valid");
  }

  const project = await projectmodel.findOne({
    _id: projectId,
  }).populate('users');

  return project;
};

const updateFileTree = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId format");
  }

  if (!fileTree || typeof fileTree !== "object") {
    throw new Error("Invalid fileTree format");
  }

  console.log("Updating FileTree for Project:", projectId);
  console.log("FileTree Data:", JSON.stringify(fileTree, null, 2));

  const project = await projectmodel.findOneAndUpdate(
    { _id: projectId },
    { fileTree },
    { new: true }
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};


module.exports = { createProject, getAllProjects ,addUserToProject,getProjectsById,updateFileTree};
