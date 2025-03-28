import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { registerAdmin, loginAdmin, logoutAdmin, showSignup, showLogin} from "../controllers/admin.controller.js"
const router=Router();
router.route("/register").get(showSignup);//route for getting an Ejs template
router.route("/register").post(isLoggedIn,registerAdmin)
router.route("/login").get(showLogin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(isLoggedIn, logoutAdmin);
// router.route("/refreshtoken").post(refreshAccessToken);
export default router;