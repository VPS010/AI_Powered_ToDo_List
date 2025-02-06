import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  Search,
  CheckCircle,
  Circle,
  Bot,
  User,
  Sparkles,
  Zap,
  SmilePlus,
  Ghost,
} from "lucide-react";

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

  const sarcasticResponses = {
    add: [
      (task) => `Another task? *sigh* Added "${task}" to your endless list`,
      (task) => `Wow, groundbreaking: "${task}"... added.`,
      (task) => `Sure thing boss, I'll prioritize "${task}" right after my nap`,
    ],
    delete: [
      (task) => `Deleted "${task}". Was it too hard for you?`,
      (task) => `Poof! "${task}" gone. Like your motivation`,
      (task) => `Finally giving up on "${task}"? Smart move`,
    ],
    search: [
      () => "Looking... just like you should be working",
      () => "Searching... this better be important",
      () => "Hold your horses, I'm not Google",
    ],
    default: [
      () => "What now?",
      () => "You're still here?",
      () => "I get paid hourly for this, right?",
    ],
  };

  const getSarcasticResponse = (action, task = "") => {
    const responses = sarcasticResponses[action] || sarcasticResponses.default;
    return responses[Math.floor(Math.random() * responses.length)](task);
  };

  // Modified handleSend function
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      setTimeout(() => {
        const action = input.toLowerCase().includes("add")
          ? "add"
          : input.toLowerCase().includes("delete")
          ? "delete"
          : input.toLowerCase().includes("search")
          ? "search"
          : "list";

        const responseContent =
          action === "add"
            ? getSarcasticResponse(action, input.replace("add", "").trim())
            : getSarcasticResponse(action);

        const aiMessage = {
          type: "ai",
          content: responseContent,
          action: action,
          emoji: ["🤖", "😒", "🙄", "😏"][Math.floor(Math.random() * 4)],
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (action === "add") {
          setTodos((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: input.replace("add", "").trim(),
              done: false,
              addedAt: new Date().toLocaleTimeString(),
            },
          ]);
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // Updated UI components with new theme
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-950 animate-gradient-x">
      <div className="flex-1 flex p-6 gap-6">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-gray-900/80 rounded-2xl overflow-hidden border-2 border-purple-500/30 backdrop-blur-lg">
          <div className="p-4 bg-purple-900/50 border-b border-purple-500/30">
            <div className="flex items-center gap-3">
              <Ghost className="text-pink-400 animate-float" size={28} />
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                  SassyTaskMaster 9000
                </h2>
                <p className="text-sm text-purple-300">Here to "help"</p>
              </div>
              <SmilePlus className="ml-auto text-yellow-400" size={20} />
            </div>
          </div>

          {/* Updated Chat Messages */}
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${
                      message.type === "user"
                        ? "bg-pink-500/20 border-2 border-pink-400/50"
                        : "bg-blue-500/20 border-2 border-blue-400/50"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User size={20} className="text-pink-400" />
                    ) : (
                      <div className="relative">
                        <Bot size={20} className="text-blue-400" />
                        <span className="absolute -top-2 -right-2 text-lg">
                          {message.emoji}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.type === "user"
                        ? "bg-pink-500/20 text-pink-100 border-2 border-pink-400/30"
                        : "bg-blue-500/20 text-blue-100 border-2 border-blue-400/30"
                    } shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <p className="text-sm font-medium">{message.content}</p>
                    {message.type === "ai" && (
                      <div className="mt-2 flex items-center gap-2 text-blue-200">
                        <Zap size={14} className="animate-pulse" />
                        <span className="text-xs">
                          Sass Level: {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Loading animation updated */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center">
                    <Bot size={20} className="text-blue-400" />
                  </div>
                  <div className="bg-blue-500/20 rounded-2xl p-4 border-2 border-blue-400/30">
                    <div className="flex space-x-2 items-center">
                      <span className="text-sm text-blue-200">
                        Generating sarcasm
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Updated Input Area */}
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
                  <Send
                    size={24}
                    className="hover:rotate-12 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Todo List Section */}
        <div className="w-96 flex flex-col bg-gray-900/80 rounded-2xl border-2 border-green-400/30 backdrop-blur-lg">
          <div className="p-4 bg-green-900/50 border-b border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="text-green-400 animate-twinkle"
                  size={24}
                />
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                  Your Sisyphean Tasks
                </h2>
              </div>
              <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full border border-green-500/30">
                {todos.length} {todos.length === 1 ? "regret" : "regrets"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border-2 border-green-500/20 hover:border-green-400/50 transition-all hover:scale-[1.02]"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="text-green-400/50 hover:text-green-400 transition-colors"
                  >
                    {todo.done ? (
                      <CheckCircle
                        className="text-green-400 animate-pop"
                        size={24}
                      />
                    ) : (
                      <Circle size={24} className="hover:stroke-[3px]" />
                    )}
                  </button>
                  <div className="flex-1">
                    <span
                      className={`text-sm ${
                        todo.done
                          ? "line-through text-green-400/50"
                          : "text-green-200"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="text-xs text-green-400/50 mt-1">
                      Added: {todo.addedAt}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-green-400/50 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={18} className="hover:animate-shake" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoChatApp;
