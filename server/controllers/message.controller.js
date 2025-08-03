import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSidebar = async(req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne:userId}}).select("-password");
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user)=>{
            const messages = await Message.find({senderId : user._id, receiverId : userId, seen : false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        return res.status(200).json({success: true, users : filteredUsers, unseenMessages});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success: false, message : error.message});
    }
}

export const getMessages = async(req,res)=>{
    try {
        const {id : selectedUserId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or :[
                {senderId : myId, receiverId : selectedUserId},
                {senderId : selectedUserId, receiverId : myId}
            ]
        })

        await Message.updateMany({senderId : selectedUserId, receiverId : myId}, {seen : true});
        return res.status(200).json({success: true, messages});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success: false, message : error.message});
    }
}

//api to mark messages as seen

export const markMessageSeen = async(req,res)=>{
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen : true});
        return res.status(200).json({success: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success: false, message : error.message});
    }
}

export const sendMessage = async(req,res)=>{
    try {
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageurl;
        if(image){
            const upload = await cloudinary.uploader.upload(image);
            imageurl = upload.secure_url;
        }

        const message = await Message.create({senderId, receiverId, text, image:imageurl});

        //Emit the message to the receiver
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", message);
        }
        return res.status(200).json({success: true, message});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success: false, message : error.message});
    }
}