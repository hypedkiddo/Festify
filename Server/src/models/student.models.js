import mongoose,{Schema} from "mongoose";

const Studentschema=new Schema({
    username:{
       type:String,
       unique:true,
       trim:true,
       lowercase:true,
       required:true,
       index:true //this enables faster search operation
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    }
},{timestamps:true});

export const Student=mongoose.model("Student",Studentschema);