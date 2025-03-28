import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"; //Generate access and refresh token
import bcrypt from "bcrypt";//Use for hashing of passwords

const userschema=new Schema({
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
    image:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    college: {
        type: String,
        required: true,
    },
    qrGenerated:{
        type:Boolean,
        default:false //false indicated that Qr is to be scanned yet
    },
    qrVerified:{
        type:Boolean,
        default:false
    }
  
},{timestamps:true});

//Logic for hashing and storing the password
userschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);//hash the password
    next();//call the next middleware function
})

//Generating Access token
userschema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            role:this.role,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//Generating REFRESH  token
userschema.methods.generateRefreshToken=function(){
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
userschema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}


export const User=mongoose.model("User",userschema);

