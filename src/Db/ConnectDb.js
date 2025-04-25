import mongoose from "mongoose";
import {DbName} from "../../Constants.js";
const DbConnect=async()=>{
   try {
     let connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DbName}`);
     console.log(`mongoDB is connected /n DB HOST:${connectionInstance.connection.host}`);
   } catch (error) {
    console.log("Can't connect with Db");
    console.log(error.message);
   }
}
export default DbConnect;