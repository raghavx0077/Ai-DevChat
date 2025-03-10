const userModel =require('../models/usermodel')
const createUser =async({email,password})=>{
    
       if(!email || !password)
        {
           return res.status(400).json({message:"Please fill the required field correctly"})
        }


        const hashPassword =await userModel.hashPassword(password);
        const user=await userModel.create({email,password :hashPassword});
        return user;
    }

const getAllUsers=async(userId)=>{
    const users=await userModel.find({
        _id:{$ne:userId}
    })
    return users;
}

module.exports={createUser,getAllUsers};    
    
