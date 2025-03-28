import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { registerSecurityUser, loginSecurityUser, logoutSecurityUser, showSignup, showLogin } from "../controllers/Security.controllers.js"
const router=Router();
router.route("/register").get(showSignup);//route for getting an Ejs template
router.route("/register").post(  registerSecurityUser)
router.route("/login").get(showLogin);
router.route("/login").post(loginSecurityUser);
router.route("/logout").post(isLoggedIn,   logoutSecurityUser);
// router.route("/refreshtoken").post(refreshAccessToken);
export default router;