const userModel=require('../models/usermodel');
const {createUser,getAllUsers}=require('../services/user.service')

const {validationResult}=require('express-validator');
const redisClient=require('../services/redis.service');
const { create } = require('../models/project.model');

//Register part


const createUserController =async(req,res)=>{
  
const errors=validationResult(req);
if(!errors.isEmpty())
{
    return res.status(400).json({errors:errors.array()});
}
 try{
  

    const user=await createUser(req.body);
    const token=await user.generateJWT();
    res.status(201).send({user,token});
    console.log('Created User:',user);
 }
 catch(error)
 {
   console.log('error in createUserController',error);

   if(error.code===11000){
      return res.status(400).json({message:'Email already exists'});
   }
    res.status(400).send(error.message);
 }
}

//login part

const loginUserController=async(req,res)=>{
   const errors=validationResult(req);
   if(!errors.isEmpty())
   {
      console.log(errors);
      return res.status(400).json({errors:errors.array()});
   }
   try{
      const {email,password}=req.body;

      const user=await userModel.findOne({email}).select('+password');

      if(!user)
      {
         return res.status(401).json({errors:'Invalid credentials'});
      }

      const isMatch =await user.isValidPassword(password);

      if(!isMatch)
      
         {
         return res.status(401).json({errors:'Invalid credentials'});
         }

         const token=await user.generateJWT();
         console.log(token);
         
         delete user._doc.password;
         res.status(200).json({ user, token});

   }
   catch(error)

   {
      console.log(error);
      res.status(400).send(error.message);
   }
}

//Profile controller part

const profileController=async(req,res)=>{
try{
   console.log(req.user);
res.status(200).json({user:req.user});
}
catch(error)
{
   console.log(error);
   res.status(400).send(error.message);
}
}

//logout controller part
const logoutController=async(req,res)=>{
   try{
      const token =req.cookies.token || req.headers.authorization.
      split(' ')[[1]];

      redisClient.set(token,'blacklisted', 'EX', 60*60*24 );

      res.status(200).json({
         message:'Logged out successfully'
      });
   }
   catch(error)
   {
      console.log(error);
      res.status(400).send(error.message);
   }

}

//Get all users controller part
const getAllUsersController=async(req,res)=>{
   try{

      const loggedInUser=await userModel.findOne({email:req.user.email})

      const allUsers= await getAllUsers(loggedInUser);
     

      return res.status(200).json({
         users: allUsers});

   }catch(error){
      console.log(error);
      res.status(400).send(error.message);
}
}
module.exports={createUserController,loginUserController,profileController,logoutController,getAllUsersController};
