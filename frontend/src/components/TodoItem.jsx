import React from "react";
import { CheckCircle, Circle, Trash2 } from "lucide-react";

const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="group flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border-2 border-green-500/20 hover:border-green-400/50 transition-all hover:scale-[1.02]">
      <button
        onClick={() => onToggle(todo._id)}
        className="text-green-400/50 hover:text-green-400 transition-colors"
      >
        {todo.done ? (
          <CheckCircle className="text-green-400 animate-pop" size={24} />
        ) : (
          <Circle size={24} className="hover:stroke-[3px]" />
        )}
      </button>
      <div className="flex-1">
        <span
          className={`text-sm ${
            todo.done ? "line-through text-green-400/50" : "text-green-200"
          }`}
        >
          {todo.task}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo._id)}
        className="opacity-8 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all"
      >
        <Trash2 size={18} className="hover:animate-shake" />
      </button>
    </div>
  );
};

export default TodoItem;
