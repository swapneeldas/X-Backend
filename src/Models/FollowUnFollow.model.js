import mongoose,{Schema} from "mongoose";
let FollowUnFollowSchema=new Schema({
    Follower:{
        type:mongoose.Types.ObjectId,
        ref:"users",
        require:true
    },
    Following:{
        type:mongoose.Types.ObjectId,
        ref:"users",
        require:true,
    }
})
const FollowUnFollow=mongoose.model("FollowUnFollow",FollowUnFollowSchema);
export default FollowUnFollow;