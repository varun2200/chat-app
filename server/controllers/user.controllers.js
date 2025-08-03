import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

export const signup = async(req,res)=>{
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio) return res.status(400).json({error:"All fields are required"});
        const user = await User.findOne({email});
        if(user) return res.status(400).json({error:"User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({fullName, email, password:hashedPassword, bio});
        const token = generateToken(newUser._id);

        return res.status(200).json({success:true, userData : newUser, token, message : "Account Created Successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message : error.message});
    }
}

//Login

export const login = async(req,res)=>{
    const { email, password } = req.body;
    try {
        if(!email || !password) return res.status(400).json({ success : false ,message:"All fields are required"});
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({success: false, message:"User does not exist"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({success : false,message:"Invalid credentials"});
        const token = generateToken(user._id);

        return res.status(200).json({success: true, user, token, message : "Login Successful"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message : error.message});
    }
}

export const checkAuth = async(req,res)=>{
    return res.status(200).json({success: true, user : req.user});
}

export const updateProfile = async(req, res)=>{
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        } 
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})

        }
        return res.status(200).json({success:true, message:"User has been updated"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message : error.message});
    }
}