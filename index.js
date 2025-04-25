import express from "express";
import DbConnect from "./src/Db/ConnectDb.js";
import app from "./app.js";
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