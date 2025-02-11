import React from "react";
import { Sparkles } from "lucide-react";

const TodoHeader = ({ todoCount }) => {
  return (
    <div className="p-4 bg-green-900/50 border-b border-green-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-400 animate-twinkle" size={24} />
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            Task Arena
          </h2>
        </div>
        <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full border border-green-500/30">
          {todoCount} {todoCount === 1 ? "Challenge🔥" : "Challenges🔥"}
        </span>
      </div>
    </div>
  );
};

export default TodoHeader;
