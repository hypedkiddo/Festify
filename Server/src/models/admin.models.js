import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"; //Generate access and refresh token
import bcrypt from "bcrypt";//Use for hashing of passwords

const adminschema=new Schema({
    username:{
       type:String,
       unique:true,
       trim:true,
       lowercase:true,
       required:true,
       index:true //this enables faster search operation
    },
    password:{
        type:String,
        unique:true,
        required:true,
        trim:true,
    },
    isAdmin: {
        type: Boolean,
        default: true, // Admins have this set to true by default
    },
},{timestamps:true});

//Logic for hashing and storing the password
adminschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);//hash the password
    next();//call the next middleware function
})

//Generating Access token
adminschema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//Generating REFRESH  token
adminschema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
//Method to verify password
adminschema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}


export const Admin=mongoose.model("Admin",adminschema);

