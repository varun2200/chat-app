import React, { useContext, useState } from "react";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import { ChatContext } from "../../context/chatContext";

const HomePage = () => {
    const {selectedUser, setSelectedUser} = useContext(ChatContext);
    return(
        <div className="border w-full h-screen sm:px-[15%] sm:py - [5%]">
            <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative
                ${selectedUser
                    ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
                    : "md:grid-cols-[1fr_1.5fr]"}`}>
                <SideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                <ChatContainer selectedUser={selectedUser} setselectedUser={setSelectedUser} />
                {selectedUser && <RightSideBar selectedUser={selectedUser} setselectedUser={setSelectedUser} />}
            </div>
        </div>
    )
};

export default HomePage;