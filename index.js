import express from "express";
import DbConnect from "./src/Db/ConnectDb.js";
import { v2 as cloudinary } from "cloudinary";
import app from "./app.js";
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});
DbConnect().then(()=>{ 
    app.on("error",(error)=>{
        console.log(error);
        throw error;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`The Server is listening in PORT : ${process.env.PORT||8000}`);
    })
}
)