import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { connectDB } from "./lib/dbconnect.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);
export const io = new Server(server, {cors: {origin: "*"}});

//Store Online Users
export const userSocketMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);
    if(userId)  userSocketMap[userId] = socket.id;
    
    //Emit Online Users to all connected clients

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

app.use(express.json({limit:"4mb"}))
app.use(cors());

app.use("/api/status",(req,res)=>res.send("Server is live"));
app.use("/api/auth", userRouter)
app.use("/api/message", messageRouter)


await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
}

export default server;