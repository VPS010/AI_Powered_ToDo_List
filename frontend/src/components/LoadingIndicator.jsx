import React from "react";
import { Bot } from "lucide-react";

const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center">
          <Bot size={20} className="text-blue-400" />
        </div>
        <div className="bg-blue-500/20 rounded-2xl p-4 border-2 border-blue-400/30">
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-blue-200">typing...</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
