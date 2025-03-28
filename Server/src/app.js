import express,{urlencoded} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
const app=express();
//Express-session middleware
import session from "express-session";
app.use(session({
    secret: 'mysecretsupercode',
    resave: false,
    saveUninitialized: true,
  }))
app.use(cookieParser());//middleware to parse cookies
//Flash package to display flash messages to the user
import flash from "connect-flash";
app.use(flash());
//cors middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,//Accept requests from these origin routes only
    credentials:true
}));
//------use of ejs mate for a better templating experience
import engine from "ejs-mate"
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//middleware to handle PUT and DELETE requests
app.use(methodOverride("_method"));
//middleware to handle payload on req object
app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user || null 
    
    next();
})
//Register and Login  a user
import userRouter from "./routes/User.routes.js"
app.use("/api/v1/users",userRouter);

//Handling CRUD operations on Event 
import eventRouter from "./routes/Events.routes.js"
app.use("/api/v1/events",eventRouter);

//Register and Login a Admin
import adminRouter from "./routes/Admin.routes.js"
app.use("/api/v1/admin",adminRouter);

//Register and Login a Security
import securityRouter from "./routes/Security.routes.js"
app.use("/api/v1/security",securityRouter);

export default app;