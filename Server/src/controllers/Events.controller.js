import {asyncHandler} from "../utils/asyncHandler.js"; //Wrappper to handle asynchronous functions
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Event} from "../models/event.models.js";
import {Student} from "../models/student.models.js"

const showEvent=async (req,res)=>{
    let {id}=req.params;
    const event=await Event.findById(id)
    const user=req.user;
    const isStudent =await Student.findOne({email:user.email});
    console.log(isStudent);
    res.render("listings/show1.ejs",{event,isStudent})
}
///-----------List all Events
const showclient =asyncHandler(async(req,res)=>{
    const data= await Event.find({});
    res.status(200)
    .json(
        new ApiResponse(200,data,"Data sent successfully")
    )
})
const showlistings=asyncHandler(async(req,res)=>{
    const data= await Event.find({});
    //Sending Json Response
    // res.status(200)
    // .json(
    //     new ApiResponse(200,data,"Data sent successfully")
    // )
    //Rendering an Ejs template
    req.flash("success","Welcome Back!!");
    res.status(200).render("listings/index.ejs", { data });
})


//--------------Create an Event-------------------
const renderNewform=(req,res)=>{
    console.log(req.cookies.accessToken)
    res.render("listings/new.ejs");
}
const createlistings=asyncHandler(async(req,res)=>{
    console.log(req.body);
    const {title,description,price,location}=req.body;
    //get the local file path from multer
    if (!req.files?.image || req.files.image.length === 0) {
        throw new ApiError(400, "No image file uploaded");
    }    
    const eventImageLocalPath=req.files?.image[0]?.path;
    //upload it in cloudinary
    const eventimageurl=await uploadOnCloudinary(eventImageLocalPath);
    if(!eventimageurl){
        throw new ApiError(500,"Something went wrong while uploading image to cloudinary")
    }
    const newevent= await Event.create({
        title,
        description,
        image:eventimageurl.url,
        price,
        location 
    })
    req.flash("success","New Event created");
    res.redirect("/api/v1/events/list");
    // res.status(200).json(
    //     new ApiResponse(200,newevent,"New Event created successfully")
    // )
})
//--------------update  an Event-------------------
const updateform=async(req,res)=>{
    let {id}=req.params;
    const existingEvent=await Event.findById(id)
    res.render("listings/edit.ejs",{existingEvent})
}
const updatelistings=asyncHandler(async(req,res)=>{
    const {id}=req.params
    const {title,description,price,location}=req.body

    const existingEvent=await Event.findById(id)
    if(!existingEvent){
        throw new ApiError(404, "Event not found")
    }
    let eventimageurl = existingEvent.image;
    if (req.files?.image && req.files.image.length > 0) {
        const eventImageLocalPath = req.files.image[0].path;

        try {
            eventimageurl = await uploadOnCloudinary(eventImageLocalPath)

            // Optional: Delete the old image from Cloudinary (if applicable)
            // await deleteFromCloudinary(existingEvent.image);
        } catch (error) {
            throw new ApiError(500, "Error uploading new image to Cloudinary")
        }
    }
    //now update it to database
    const updatedEvent=await Event.findByIdAndUpdate(id,{
                title: title || existingEvent.title,
                description: description || existingEvent.description,
                image: eventimageurl,
                price: price || existingEvent.price,
                location: location || existingEvent.location,
    },{new:true})
    req.flash("success","Event updated successfully");
    res.status(200).redirect("/api/v1/events/list")
    // res.status(200).json(
    //     new ApiResponse(200,updatedEvent,"Event Updated successfully")
    // )
})
//--------------delete an Event-------------------
const deletelistings=asyncHandler(async(req,res)=>{
    const {id}=req.params
    const deletedEvent = await Event.findByIdAndDelete(id);
    if(!deletedEvent){
        throw new ApiError(404,"Event not found")
    }
    req.flash("error","Event Deleted successfully!!");
    res.status(200).redirect("/api/v1/events/list")
    // res.status(200).json(
    //     new ApiResponse(200,deletedEvent," Event deleted successfully")
    // )
})
//---------Registering an Gitian-----------


export {showlistings,updatelistings,createlistings,deletelistings,renderNewform,showEvent,updateform,showclient}