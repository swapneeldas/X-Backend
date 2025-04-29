import mongoose from "mongoose";

const NotificationsSchema=new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String
    },
    read:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        require:true,
        enum:["follow","like","comment"]
    }
},{timestamps:true})
export const Notification=mongoose.model('Notification',NotificationsSchema);