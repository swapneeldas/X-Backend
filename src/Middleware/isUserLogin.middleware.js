import jwt from "jsonwebtoken";
import User from "../Models/User.model.js";
export const isLogedIn=async (req,res,next)=>{
try {
        let AccessToken=req?.cookies?.AccessToken;
        if(!AccessToken){
           return res.status(401).json({
                "message":"You are not authorised No access Token"
            })
        }
        const decodedToken=jwt.verify(AccessToken,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            return res.status(401).json({
                "message":"You are not authorised"
            })
        }
        req.user=user;
        next();
} catch (error) {
    res.status(500).json({
        "message":"Some error occur",
        "error":error.message
    })
}
}