//  Middlware for checking tokens 
const jwt=require('jsonwebtoken');
const Admin=require('../Models/Admin');




const Authenticate = async (req,res,next)=>{
    try{
        const token=req.cookies.AdminTokens;
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);
        const rootUser=await Admin.findOne({_id:verifyToken._id,"tokens.token":token});
        
        if(!rootUser){
            throw new Error("User not found");
        }
        // universal data
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;

        next();

    }
    catch(err){
        res.status(401).send("Unauthorized no token provided");
        console.log(err);
    }
}


module.exports = Authenticate