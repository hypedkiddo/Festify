import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"; //Generate access and refresh token
import bcrypt from "bcrypt";//Use for hashing of passwords

const securityschema=new Schema({
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
    }
},{timestamps:true});

//Logic for hashing and storing the password
securityschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);//hash the password
    next();//call the next middleware function
})

//Generating Access token
securityschema.methods.generateAccessToken= function(){
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
securityschema.methods.generateRefreshToken=function(){
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
securityschema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}


export const Security=mongoose.model("Security",securityschema);

