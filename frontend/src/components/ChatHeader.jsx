import React, { useState } from "react";
import { Ghost, Info } from "lucide-react";
import About from "./About";

const ChatHeader = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <div className="p-3 md:p-4 bg-purple-900/50 border-b border-purple-500/30">
        <div className="flex items-center gap-2 md:gap-3">
          <Ghost className="text-pink-400 animate-float w-6 h-6 md:w-7 md:h-7" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg md:text-xl flex items-center font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              TaskMaster AI
              <p className="text-xl text-yellow-400 md:text-2xl ml-1">😏</p>
            </h2>
            <p className="text-xs md:text-sm text-purple-300 truncate">
              Expertly roasting your productivity since 2025
            </p>
          </div>

          {/* Desktop About Button */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="hidden md:block ml-auto bg-stone-200 hover:bg-stone-300 p-1 shadow-sm shadow-black rounded-full px-3 transition-colors duration-200 whitespace-nowrap"
          >
            About This Project
          </button>

          {/* Mobile About Button */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="md:hidden ml-auto bg-stone-200 hover:bg-stone-300 p-2 shadow-sm shadow-black rounded-full transition-colors duration-200"
            aria-label="About This Project"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default ChatHeader;
