

// components/ChatHeader.jsx
import React, { useState } from "react";
import { Ghost } from "lucide-react";
import About from "./About";

const ChatHeader = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <div className="p-4 bg-purple-900/50 border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          <Ghost className="text-pink-400 animate-float" size={28} />
          <div>
            <h2 className="text-xl flex items-center font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              TaskMaster AI <p className="text-yellow-400 text-2xl">😏</p>
            </h2>
            <p className="text-sm text-purple-300">
              Expertly roasting your productivity since 2025
            </p>
          </div>
          <div className="flex ml-auto">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="ml-auto bg-stone-200 hover:bg-stone-300 p-1 shadow-sm shadow-black rounded-full px-3 transition-colors duration-200"
            >
              About This Project
            </button>
          </div>
        </div>
      </div>

      <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default ChatHeader;
