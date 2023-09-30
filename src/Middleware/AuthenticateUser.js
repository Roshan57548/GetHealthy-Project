//  Middlware for checking tokens 
const jwt=require('jsonwebtoken');
const User=require('../Models/RegistrationUser');




const Authenticate = async (req,res,next)=>{
    try{
        res.status(403).send("Start");
        const token=req.cookies.UserTokens;
        res.status(402).send("Token",token);
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);
        res.status(405).send("verifyToken",verifyToken);
        const rootUser=await User.findOne({_id:verifyToken._id,"tokens.token":token});
        res.status(406).send("rootUser",rootUser);
        
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
        res.status(401).send("Unauthorized no token provided",err);
        console.log(err);
    }
}


module.exports = Authenticate