import { Router } from "express";
import { GetMe, logIn, logOut, UserRegister } from "../Controllers/User.Controller.js";
import { isLogedIn } from "../Middleware/isUserLogin.middleware.js";
const router=Router();
router.route("/Register").post(UserRegister);
router.route("/LogIn").post(logIn);
router.route("/LogOut").post(isLogedIn,logOut);
router.route("/GetMe").post(isLogedIn,GetMe);
export default router;