import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute = async(req,res,next)=>{
    try {
        const token = req.headers.token;
        const decodedtoken = jwt.verify(token, process.env.JWT_SECRET);
        const user =  await User.findById(decodedtoken.userId).select("-password ");

        if(!user) return res.status(401).json({success: false, message:"User not found"});
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({success: false, message:error.message});
    }
}