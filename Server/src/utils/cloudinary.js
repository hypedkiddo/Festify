import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath)return null
        //upload file on cloudinary
       const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        // console.log(response);
        fs.unlinkSync(localFilePath); //to remove the file that was temporarily saved on the server
        return response;

    } catch(error){
        fs.unlinkSync(localFilePath); //removes the locally saved  temporarly file from server as the upload operation got failed the fs is a package that handles file and it comes with Node.js by default
        return null;
    }
}

export {uploadOnCloudinary};