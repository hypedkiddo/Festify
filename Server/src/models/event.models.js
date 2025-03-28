import mongoose,{Schema} from "mongoose";
const eventSchema=Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    description:{
        type:String
    },
    image:{
        type:String,//Cloudinary url
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    location:{
        type:String,
    }
    // Organiser:{
    //     type:Schema.Types.ObjectId;
    //     ref:"User"
    // }
},{timestamps:true});

const Event=mongoose.model("Event",eventSchema);
//To avoid cofusion we will avoid using default
export  {Event};