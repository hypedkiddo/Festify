import { Router } from "express";//Router is used for routing towards Specific API endpoints
const router=Router();
import {showlistings,createlistings,updatelistings,deletelistings,renderNewform,updateform,showEvent,showclient} from "../controllers/Events.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {isLoggedIn} from "../middlewares/auth.middleware.js"
router.route("/client").get(showclient);
//default get route to display all events
router.route("/list").get(isLoggedIn,showlistings);
router.route("/individual/:id").get(isLoggedIn,showEvent)
//To create a particular event
router.route("/create").get(isLoggedIn,renderNewform)
router.route("/create").post(
    upload.fields([
        {
            name:"image",
            maxCount:1

        }
    ]),createlistings)
//Update Event 
router.route("/update/:id").get(isLoggedIn,updateform)   
router.route("/update/:id").put(
        upload.fields([
            {
                name:"image",
                maxCount:1
    
            }
        ]),updatelistings)
//Delete Event        
router.route("/delete/:id").delete(isLoggedIn,deletelistings);

export default router;