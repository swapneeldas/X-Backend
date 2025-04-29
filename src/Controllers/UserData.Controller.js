import User from "../Models/User.model.js";
import FollowUnFollow from "../Models/FollowUnFollow.model.js"
import { v2 as cloudinary } from "cloudinary";
import { Notification } from "../Models/Notification.model.js";
import mongoose from "mongoose";
const options={
    httpOnly:true,
    secure:true,
}
export const getUserProfile=async(req,res)=>{
    let{UserName}=req.params;
    console.log(UserName);
    let Profile=await User.aggregate(
        [
        {
            $match: {
                UserName:UserName
            }
        },
        {
            $lookup:{
                from:"followunfollows",
                localField:"_id",
                foreignField:"Following",
                as:"followers"
            }
        },
        {
            $lookup:{
                from:"followunfollows",
                localField:"_id",
                foreignField:"Follower",
                as:"following"
            }
        },
        {
            $addFields:{
                FollowerCount:{
                    $size:"$followers"
                },
                FollowingCount:{
                    $size:"$following"
                },
                isFollowing:{
                    $cond:{
                        if:{$in:[req.user?._id,"$followers.Follower"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                FullName:1,
                UserName:1,
                isFollowing:1,
                FollowerCount:1,
                FollowingCount:1,
                ProfileImg:1,
                CoverImg:1,
                Email:1
            }
        }
        ]
    )
   console.log(Profile);
    if(!Profile?.length){
        return res.status(400).json({"message" : "User not found in getProfile"})
    }
    return res.status(200).json(Profile)
}
export const followorunfollow=async(req,res)=>{
    let {Follow,Following}=req.body;
    let FollowData=await User.findById(Follow);
    if(!FollowData){
        return res.status(401).json({message:"Follow User Doesn't exit"});
    }
    let FollowingData=User.findById(Following);
    if(!FollowingData){
        return res.status(401).json({message:"Following User Doesn't exit"});
    }
    let AretheyFollowing=await FollowUnFollow.findOne({
       Follower:Follow,
       Following:Following
    })
    if(AretheyFollowing){
        //Unfollow
        let del=await FollowUnFollow.findOneAndDelete({
            Follower:Follow,
            Following
        });
        if(del){
            return res.status(200).json({message:"Unfollowed"})
        }
        return res.status(500).json({message:"Some error occur"})
    }
    else{
        // follow
        let create=await FollowUnFollow.create({
            Follower:Follow,
            Following
        });
        let iscreated=await FollowUnFollow.findById(create._id);
        if(iscreated){
            //need to send notification to Followed
            await Notification.create({
                from:Follow,
                to:Following,
                type:"follow",
                content:`${FollowData.FullName} started following you`
            })
            return res.status(200).json({message:"Followed"})
        }
        return res.status(500).json({message:"Some error occur"})
    }
}
export const GetAllFollower=async(req,res)=>{
    try {
       
    } catch (error) {
        res.status(500).json({"message":"something went wrong"})
    }
}
export const updateUserData=async(req,res)=>{
try {
        let {FullName,Password,PrevPassword}=req.body;
        let {ProfileImg,CoverImg}=req.body;
        if(FullName===undefined && Password ==undefined && PrevPassword==undefined && ProfileImg==undefined && CoverImg==undefined){
            return res.status(400).json({message:"Nothing to update"});
        }

        Password=Password?.trim()
        if(Password!="" && Password?.length()<6){
            return res.status(400).json({message:"New Password must contain 6 character"});
        }
        let _id=req.user._id;
        let user=await User.findById(_id);
        if(Password && PrevPassword){
            let isSame=user.isPasswordCorrect(PrevPassword);
            if(!isSame){
                return res.status(400).json({message:"Previous Password is wrong"});
            }
        }
        if(ProfileImg){
            if(user.ProfileImg!=""){
                await cloudinary.uploader.destroy(user.ProfileImg.split("/").pop().split(".")[0]);
            }
            let data=await cloudinary.uploader.upload(ProfileImg);
            ProfileImg=data.secure_url;
    
        }
        if(CoverImg){
            if(user.CoverImg!=""){
                await cloudinary.uploader.destroy(user.CoverImg.split("/").pop().split(".")[0]);
            }
            let data=await cloudinary.uploader.upload(CoverImg);
            CoverImg=data.secure_url;
        }
        user.FullName=FullName || user.FullName;
        if(Password)
            user.Password=Password
        user.ProfileImg=ProfileImg || user.ProfileImg
        user.CoverImg=CoverImg || user.CoverImg
        user=await user.save();
        user.Password=null;
        return res.status(200).json(user);
} catch (error) {
    res.status(500).json({message:"Something went wrong"});
    console.log(error.message);
}
}