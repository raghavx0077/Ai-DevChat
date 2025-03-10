const mongoose=require('mongoose');
const bcrypt =require('bcrypt');
const jwt=require('jsonwebtoken');
const userSchema= new mongoose.Schema({
  
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minlength:[6,'Email must be at least 6 characters long'],
        maxLength:[50,'Email must not be longer than 50 characters']
    },
    password:{
        type:String,
        select:false,
    }
})
userSchema.statics.hashPassword =async function(password){
    return await bcrypt.hash(password,10);
}

userSchema.methods.isValidPassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateJWT = async function() {
    // console.log('Document:', this); // Check what "this" contains
    // console.log('Email:', this.email); // Check the value of the "email" field
    return jwt.sign({ email: this.email }, process.env.Secret_Key, { expiresIn: '24h' });
};


const User=mongoose.model('user',userSchema);
module.exports=User;