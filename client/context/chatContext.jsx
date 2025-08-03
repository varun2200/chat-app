import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext(); 

export const ChatProvider = ({children})=>{
    
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(false);
    const [unseenMessages, setUnseenMessages] = useState({});
    const {axios, socket} = useContext(AuthContext);
    // const { socket, axios} = useContext(AuthContext);
    const getUsers = async()=>{
        try {
            const {data} = await axios.get("/api/message/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    const getMessages = async(userId)=>{
        try {
            const {data} = await axios.get(`/api/message/${userId}`); 
            if(data.success){
                setMessages(data.messages); 
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const sendMessage = async(message)=>{
        try {
            const {data} = await axios.post(`/api/message/send/${selectedUser._id}`, message); 
            if(data.success){
                setMessages((prevMessages) => [...prevMessages, data.message]); 
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user

    const subscribeToMessages = async()=>{
        if(!socket)  return;
        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage])
                axios.put(`/api/message/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId]?  prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    const unsubscribeFromMessages = ()=>{
        if(socket)   socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=>unsubscribeFromMessages();
    },[socket,selectedUser])

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        setSelectedUser,
        setUnseenMessages,
        sendMessage,
        getMessages
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}