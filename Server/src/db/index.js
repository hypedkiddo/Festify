import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//lets create a function to connectdatabase
const connectdatabase=async()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME
        });//asynchronous operation
        console.log("Connected to MongoAtlas Successfully");
        console.log(connectionInstance.connection.host);
    } catch(e){
        console.log("mongodb connection error",e.message);
        process.exit(1);
    }
}

export default connectdatabase;