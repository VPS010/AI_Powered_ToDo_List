const { todo } = require("../db/modle");
const { ObjectId } = require('mongodb');

const getalltodos = async (args = {}) => {
    try {
        console.log("Fetching all todos");
        const todos = await todo.find({});
        console.log("Todos found:", todos);
        return {
            status: "success",
            data: todos
        };
    } catch (error) {
        console.error("Error fetching todos:", error);
        return {
            status: "error",
            message: error.message
        };
    }
};

const createtodo = async ({ todoText }) => {
    try {
        const newtodo = await todo.create({
            task: todoText
        });
        return {
            status: "success",
            data: newtodo._id
        };
    } catch (error) {
        return {
            status: "error",
            message: error.message
        };
    }
};

const searchtodo = async ({ search }) => {
    try {
        const regex = new RegExp(search, "i");
        const searchedTodo = await todo.findOne({ task: { $regex: regex } });
        return {
            status: "success",
            data: searchedTodo
        };
    } catch (error) {
        return {
            status: "error",
            message: error.message
        };
    }
};

const deletetodo = async ({ id }) => {
    try {
        // Ensure the id is a valid MongoDB ObjectId
        const validId = id instanceof ObjectId ? id : new ObjectId(id);

        const deletedTodo = await todo.findByIdAndDelete(validId);
        if (!deletedTodo) {
            return {
                status: "error",
                message: "Todo not found"
            };
        }
        return {
            status: "success",
            message: "Todo deleted successfully",
            data: deletedTodo._id
        };
    } catch (error) {
        return {
            status: "error",
            message: error.message
        };
    }
};
module.exports = { getalltodos, createtodo, searchtodo, deletetodo };
