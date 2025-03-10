const mongoose = require('mongoose');
require('dotenv').config()

const db=()=>{
    mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("connected to MongoDb");
    })
    .catch((err)=>console.log("error",err));
}
module.exports=db;