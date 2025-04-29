import {z} from "zod";
import User from "../Models/User.model.js";
import jwt from "jsonwebtoken";
const options={
    httpOnly:true,
    secure:true,
}
async function generateAccessAndRefreshToken(user){
    let RefreshToken=await user.generateRefreshToken();
    let AccessToken=await user.generateAccessToken();
    user.RefreshToken=RefreshToken
    await user.save({validateBeforeSave:false});
    return {RefreshToken,AccessToken};
}
export const UserRegister= async (req,res)=>{
    let bodyschema=z.object({
        FullName:z.string(),
        UserName:z.string()
        .min(6,{message:"String must contain more than 5 character"})
        .max(16,{message:"String must contain less than 17 character"}),
        Password:z.string().min(6).max(16),
        Email:z.string()
        .email({
            message:"Email not valid"
        }),
    })
    let isOk=bodyschema.safeParse(req.body);
    if(!isOk.success){
        console.log(`error ${isOk.error}`)
        return res.status(404).json({
            "message":"wrong Input"
        })
    }
    else{
       let {FullName,Email,Password,UserName}=req.body;
       const existedUser=await User.findOne({
        $or:[{UserName},{Email}]
       })
       if(existedUser){
        return res.status(409).json({
            "message":"User Already exist"
        })
       }
       const  user=await User.create({
        FullName,
        Email,
        Password,
        UserName
       })
       const iscreated=await User.findById(user._id).select(
        "-password -refreshToken"
       );
       if(!iscreated){
          return res.status(500).json({"message":"Something went wrong while registering user"})
       }
       let {RefreshToken,AccessToken}=await generateAccessAndRefreshToken(iscreated);
       return res
       .status(201)
       .cookie("AccessToken",AccessToken,options)
       .cookie("RefreshToken",RefreshToken,options)
       .json(
        {
         FullName,
         Email,
         UserName,
         "message":"User registered Successfully",
        }
       )
    }
}
export const logIn=async(req,res)=>{
    let bodyschema=z.object({
        UserName:z.string()
        .min(6,{message:"String must contain more than 5 character"})
        .max(16,{message:"String must contain less than 17 character"}),
        Password:z.string().min(6).max(16),
        Email:z.string()
        .email({
            message:"Email not valid"
        }),
    })
    let isOk=bodyschema.safeParse(req.body);
    if(!isOk.success){
        console.log(`error ${isOk.error}`)
        return res.status(404).json({
            "message":"wrong Input"
        })
    }
    let {UserName,Password,Email}=req.body;
    const existedUser=await User.findOne({
        $and :[{UserName},{Email}]
       })
    if(!existedUser){
    console.log(`error ${isOk.error}`)
    return res.status(404).json({
        "message":"User with this details doesn't exist"
    })
    }
    let isPasswordCorrect=existedUser.isPasswordCorrect(Password);
    if(!isPasswordCorrect){
        return res.status(404).json({
            "message":"User with this details doesn't exist"
        })
    }
    let {RefreshToken,AccessToken}=await generateAccessAndRefreshToken(existedUser);
    return res
    .status(201)
    .cookie("AccessToken",AccessToken,options)
    .cookie("RefreshToken",RefreshToken,options)
    .json(
     {
      FullName:existedUser.FullName,
      Email,
      UserName,
      "message":"User registered Successfully",
     }
    )
}
export const refreshAccessToken=async(req,res)=>{
try {
        const incomingRefreshToken=req.cookies.refreshToken || req.body.RefreshToken;
        if(!incomingRefreshToken){
            res.status(400).json({"message":"unauthorized request"})
        }
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.RefreshToken){
            res.send(401).json({"message":"Refresh token is not valid"})
        }
        let {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshtoken",refreshToken,options)
} catch (error) {
    res.status(500).json({
        "message":"Something went wrong"
    })
}
}
//secure routes
export const logOut=async(req,res)=>{
    await User.findByIdAndUpdate(
        
        req.user._id,
        {
            $unset:{
                RefreshToken:1
            }
        },
        {
            new:true,
        }
    
    );
        return res
        .status(200)
        .clearCookie("AccessToken",options)
        .clearCookie("RefreshToken",options)
        .json({
            message:"User logged Out"
        })
    }
export const GetMe=async(req,res)=>{
    console
    let id=req.user._id;
    if(!id){
       return res.status(401).json({"message":"Not authorise"});
    }
    let user=await User.findById(id).select("-Password -RefreshToken");
    if(!user){
        return res.status(401).json({"message":"Not authorise"});
    }
    let {FullName,UserName,CoverImg,ProfileImg,Email}=user;
    return res.status(200).json({FullName,UserName,CoverImg,Email,ProfileImg});
}