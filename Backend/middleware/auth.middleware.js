const jwt =require('jsonwebtoken');
const redisClient =require('../services/redis.service')

const authUser=async (req,res,next)=>{
try{
    const token=req.cookies.token || req.headers.authorization.split(' ')[1];
    // console.log('Headers:', req.headers);

    // console.log('Cookies:', req.cookies);
    // console.log(token);

    if(!token)
    {
        return res.status(401).json({errors:'Unauthorized User'});
        
    }
    const isBlackListed=await redisClient.get(token);
    // console.log('isBlackListed:', isBlackListed);

    if(isBlackListed){
       
        res.cookie('token','');
        return res.status(401).send({error:'Unauthorized User'
        });
    }
    

    const decoded=jwt.verify(token,process.env.Secret_Key);
    // console.log('Decoded Token:', decoded); 
    req.user=decoded;
    next();
    
}
catch(error)
{
    console.log(error);
    return res.status(401).send({message:'User profile accessed ',errors:'Unauthorized User'});
}

}

module.exports={authUser};