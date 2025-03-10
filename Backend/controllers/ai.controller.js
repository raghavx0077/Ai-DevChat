const ai =require( '../services/ai.service.js');

const getResult= async (req,res) => {
    try{
    const {prompt} =req.query;
    const result =await ai.generateResult(prompt);
    res.json({result})
    }catch(error) {
        console.log("Error:", error);
    }; 
}


module.exports={getResult};