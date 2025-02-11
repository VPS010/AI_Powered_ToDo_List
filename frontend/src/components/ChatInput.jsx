import React from "react";
import { Send } from "lucide-react";

const ChatInput = ({ input, setInput, handleSend, loading }) => {
  return (
    <div className="p-4 bg-purple-900/50 border-t border-purple-500/30">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="What impossible task shall we add today?"
            className="w-full bg-purple-900/30 text-purple-100 rounded-xl px-4 py-3 pr-12 border-2 border-purple-500/30 focus:outline-none focus:border-pink-400 placeholder-purple-400/70 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-300 disabled:opacity-50 p-2 hover:animate-pulse"
          >
            <Send size={24} className="hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
