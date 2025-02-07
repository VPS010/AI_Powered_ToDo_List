const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectdb");
const { TodoAIChat } = require("./ai_agent/agent")
const { todo } = require("./db/modle")


// Configuration
dotenv.config();
const app = express();
connectDB();


app.get("/", async (req, res) => {

    const todos = await todo.find({});
    res.json(
        todos
    )

})

app.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const oldtodo = await todo.deleteOne({ _id: id });
    res.json(oldtodo)
})

app.put("/done/:id", async (req, res) => {
    const id = req.params.id;

    const thattodo = await todo.findOne({ _id: id });
    const donetodo = await todo.updateOne({
        _id: id
    }, {
        done: !thattodo.done
    })
    res.json(donetodo);
})


app.post("/ai", (req, res) => {


    const input = req.body.text
    res.json({
        msg: Final_Response
    })
})



const todoAI = new TodoAIChat();
todoAI.startInteractiveLoop().catch(console.error);

app.listen(3000, () => {
    console.log(">> Server running on port 3000");
});
