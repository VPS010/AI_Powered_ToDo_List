import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Trash2,
  CheckCircle,
  Circle,
  Bot,
  User,
  Zap,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const TodoChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTodos();

    socket.on("response", (response) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.content.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setLoading(false);

      if (response.content.requiresUpdate) {
        fetchTodos();
      }
    });

    socket.on("todoUpdated", (updatedTodos) => {
      setTodos(updatedTodos);
    });

    return () => {
      socket.off("response");
      socket.off("todoUpdated");
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    socket.emit("message", input);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/delete/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`http://localhost:3000/done/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };
  // Updated UI components with new theme
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="flex-1 flex p-6 gap-6 relative">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-600/50 backdrop-blur-lg shadow-xl">
          <div className="p-4 bg-slate-700/50 border-b border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
                <Bot className="text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-100">
                  TaskMaster AI
                </h2>
                <p className="text-sm text-slate-400">
                  Expertly roasting your productivity since 2023
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[70%] ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      message.type === "user"
                        ? "bg-indigo-500/20 border border-indigo-400/30"
                        : "bg-emerald-500/20 border border-emerald-400/30"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User size={18} className="text-indigo-400" />
                    ) : (
                      <Bot size={18} className="text-emerald-400" />
                    )}
                  </div>
                  <div
                    className={`rounded-xl p-3 transition-all ${
                      message.type === "user"
                        ? "bg-indigo-500/20 border border-indigo-400/30"
                        : "bg-emerald-500/20 border border-emerald-400/30"
                    } hover:bg-opacity-30`}
                  >
                    <p className="text-sm text-slate-200">{message.content}</p>
                    {message.type === "ai" && (
                      <div className="mt-2 flex items-center gap-2 text-emerald-400/80">
                        <Zap size={14} className="animate-pulse" />
                        <span className="text-xs">
                          Motivation Level: {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Loading indicator remains similar */}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-700/50 border-t border-slate-600/50">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="What's your next brilliant idea?"
                  className="w-full bg-slate-600/20 text-slate-200 rounded-lg px-4 py-3 pr-12 border border-slate-500/30 focus:outline-none focus:border-indigo-400 placeholder-slate-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 disabled:opacity-50 p-2 transition-colors"
                >
                  <Send
                    size={20}
                    className="hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Todo List Section */}
        <div className="w-96 flex flex-col bg-slate-800/90 rounded-2xl border border-slate-600/50 backdrop-blur-lg shadow-xl">
          <div className="p-4 bg-slate-700/50 border-b border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                  <Sparkles className="text-emerald-400" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Task Arena
                </h2>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full border border-emerald-400/30">
                {todos.length} {todos.length === 1 ? "Challenge" : "Challenges"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {todos.map((todoItem) => (
              <div
                key={todoItem._id}
                className="group flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg"
              >
                <button
                  onClick={() => handleToggle(todoItem._id)}
                  className="text-emerald-400/50 hover:text-emerald-400"
                >
                  {todoItem.done ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                <div className="flex-1">
                  <span
                    className={`text-sm ${
                      todoItem.done
                        ? "line-through text-slate-500"
                        : "text-slate-300"
                    }`}
                  >
                    {todoItem.task}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(todoItem._id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoChatApp;
