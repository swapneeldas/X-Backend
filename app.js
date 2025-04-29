import express, { Router } from "express";
import UserRoute from "./src/Routes/User.route.js";
import UserDataRoute from "./src/Routes/UserData.route.js"
import cookieParser from "cookie-parser";
import { getUserProfile } from "./src/Controllers/UserData.Controller.js";
const app=express();
app.use(express.json({limit:"16kb"}))
app.use(cookieParser());
app.use(express.urlencoded(
    {extended:true,
     limit:"16kb"
    }));
app.use(express.static("public"))
//route
app.use("/user",UserRoute);
app.use("/UserData",UserDataRoute);
export default app;