const mongoose =require('mongoose');
const projectSchema= new mongoose.Schema({

    name:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:[true,"project name must be unique"]
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'user'
    }],
    fileTree:{
        type: Object,
        default:{}
    }
})

const Project=mongoose.model('project',projectSchema);
module.exports=Project;