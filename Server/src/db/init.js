// Caution:This file Erases and completely reintialises the database
import dotenv from "dotenv";
dotenv.config({
    path: "../../.env"
});
import { students } from "./data.js";
import { Student } from "../models/student.models.js";
import connectdatabase from "./index.js";

connectdatabase();

//function
const initdb=async()=>{
    await Student.deleteMany({});
    const data= await Student.insertMany(students);
    console.log("Mass import Successfull");
};

initdb();



