import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

// Import Components
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import ChatInput from "./components/ChatInput";
import TodoHeader from "./components/TodoHeader";
import TodoList from "./components/TodoList";

// Get base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Initialize socket with base URL
const socket = io(BASE_URL);

const TodoChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchTodos();

    socket.on("response", (response) => {
      if (!response.content.message) return;

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.content.message,
          emoji: [
            "🤖",
            "😒",
            "🙄",
            "😏",
            "😓",
            "🤨",
            "🫡",
            "🙄",
            "🤪",
            "😤",
            "😒",
          ][Math.floor(Math.random() * 12)],
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
      const response = await axios.get(`${BASE_URL}/todos`);
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
      await axios.delete(`${BASE_URL}/delete/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`${BASE_URL}/done/${id}`);
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 animate-gradient-x">
      <div className="flex-1 flex p-4 gap-6">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-gray-900/80 rounded-2xl overflow-hidden border-2 border-purple-500/30 backdrop-blur-lg">
          <ChatHeader />

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading && <LoadingIndicator />}
            <div ref={chatEndRef} />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        </div>

        {/* Todo List Section */}
        <div className="w-96 flex flex-col bg-gray-900/80 rounded-2xl border-2 border-green-400/30 backdrop-blur-lg">
          <TodoHeader todoCount={todos.length} />
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoChatApp;
