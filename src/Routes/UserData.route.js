import express from "express";
import {multerUpload} from "../Middleware/Multer.middleware.js"
import { isLogedIn } from "../Middleware/isUserLogin.middleware.js";
import { followorunfollow, getUserProfile, updateUserData } from "../Controllers/UserData.Controller.js";

const router=express.Router();

router.get("/profile/:UserName",getUserProfile);
router.post("/followunfollow",followorunfollow);
// router .get("/suggested",isLogedIn,getUserProfiles)
// router .get("/follow",isLogedIn,followUnfollowUser)
router.post("/update",
    isLogedIn,
    multerUpload.fields(
     [
        {name:"ProfileImg",
            maxCount:1
        },
        {
            name:"CoverImage",
            maxCount:1
        }
     ])
    ,
    updateUserData)

export default router;