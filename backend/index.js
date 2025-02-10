const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectdb");
const { TodoAIChat } = require("./ai_agent/agent");
const { todo } = require("./db/modle");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

connectDB();
app.use(cors());
app.use(express.json());

// Session storage
const sessions = new Map();

// WebSocket connection
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Initialize session
    sessions.set(socket.id, {
        history: [],
        todoState: []
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        sessions.delete(socket.id);
    });

    // In the socket.io message handler:
    socket.on("message", async (message) => {
        try {
            const session = sessions.get(socket.id);
            const aiResponse = await todoAI.processUserInput(message, session.history);

            // Store with proper roles
            session.history.push({
                role: "user",
                content: JSON.stringify({ type: "user_input", content: message })
            });
            session.history.push({
                role: "model",
                content: JSON.stringify({ type: "output", content: { message: aiResponse.message } })
            });

            socket.emit("response", {
                type: "response",
                content: aiResponse
            });

            if (aiResponse.requiresUpdate) {
                const todos = await todo.find({});
                io.emit("todoUpdated", todos);
            }
        } catch (error) {
            console.error("Error:", error);
            socket.emit("response", {
                type: "error",
                content: "My circuits are a bit fried... Try again?"
            });
        }
    });
});

// Routes
app.get("/todos", async (req, res) => {
    try {
        const todos = await todo.find({});
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

app.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await todo.deleteOne({ _id: id });
        const todos = await todo.find({});
        io.emit("todoUpdated", todos);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

app.put("/done/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const todoItem = await todo.findOne({ _id: id });
        todoItem.done = !todoItem.done;
        await todoItem.save();
        const todos = await todo.find({});
        io.emit("todoUpdated", todos);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle todo" });
    }
});

// Modified TodoAIChat instance
const todoAI = new TodoAIChat();

server.listen(3000, () => {
    console.log(">> Server running on port 3000");
});