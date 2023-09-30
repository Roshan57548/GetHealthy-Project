//  Middlware for checking tokens 
const jwt=require('jsonwebtoken');
const User=require('../Models/RegistrationUser');




const Authenticate = async (req,res,next)=>{
    try{
        const token=req.cookies.UserTokens;
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);
        const rootUser=await User.findOne({_id:verifyToken._id,"tokens.token":token});
        console.log(rootUser,"roshan-1");
        if(!rootUser){
            throw new Error("User not found");
        }
        // universal data
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;
        console.log(rootUser,"roshan-2");
        next();

    }
    catch(err){
        console.log(rootUser,"roshan-3");
        res.status(401).send("Unauthorized no token provided");
        console.log(err);
    }
}


module.exports = Authenticate