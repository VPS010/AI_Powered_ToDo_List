const { todo } = require("../db/modle");
const { ObjectId } = require('mongodb');

const getalltodos = async (args = {}) => {
    try {
        console.log("Fetching all todos");
        const todos = await todo.find({}).lean(); // Convert to plain objects
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
            data: newtodo._id.toString() // Convert ObjectId to string
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
        const searchedTodo = await todo.findOne({ task: { $regex: regex } }).lean();
        if (!searchedTodo) {
            return {
                status: "error",
                message: "Todo not found"
            };
        }
        return {
            status: "success",
            data: {
                ...searchedTodo,
                _id: searchedTodo._id.toString() // Ensure ID is a string
            }
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
        if (!id) {
            return {
                status: "error",
                message: "No ID provided"
            };
        }

        if (!ObjectId.isValid(id)) {
            return {
                status: "error",
                message: "Invalid Todo ID format"
            };
        }

        const deletedTodo = await todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return {
                status: "error",
                message: "Todo not found"
            };
        }

        return {
            status: "success",
            message: "Todo deleted successfully",
            data: deletedTodo._id.toString()
        };
    } catch (error) {
        return {
            status: "error",
            message: error.message
        };
    }
};

module.exports = { getalltodos, createtodo, searchtodo, deletetodo };