const express= require('express');
const morgan =require('morgan');
const MongoDb =require('./config/Database')
const userRoutes =require('./routes/user.routes');
const projectRoutes=require('../Backend/routes/project.routes');
const aiRoutes =require('../Backend/routes/ai.routes');
const cookieParser =require('cookie-parser');
const cors=require('cors');

const app =express();

app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
 MongoDb();

 app.use('/users',userRoutes);
 app.use('/projects',projectRoutes);
 app.use('/ai',aiRoutes)

 app.get('/',(req,res)=>{
    res.send('Hello world');
 });
 
module.exports =app;
