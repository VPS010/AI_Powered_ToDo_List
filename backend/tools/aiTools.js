const { todo } = require("../db/modle");
const { ObjectId } = require('mongodb');

// Modify getalltodos tool to always refresh
const getalltodos = async () => {
    try {
        console.log("Fetching fresh todos from DB");
        const todos = await todo.find({})
            .lean({ virtuals: true })
            .setOptions({ sanitizeFilter: true })
            .exec();

        return {
            status: 'success',
            data: todos.map(t => ({
                ...t,
                _id: t._id.toString(), // Ensure string ID
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString()
            }))
        };
    } catch (error) {
        console.error("Error fetching todos:", error);
        return { status: 'error', message: error.message };
    }
};

const createtodo = async ({ todoText }) => {
    try {
        if (!todoText) throw new Error("Missing todoText parameter");

        const newtodo = await todo.create({
            task: todoText
        });

        // Return simplified response
        return {
            status: 'success',
            data: {
                id: newtodo._id.toString(),
                task: newtodo.task,
                done: newtodo.done
            }
        };
    } catch (error) {
        return {
            status: 'error',
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

const toggletodo = async ({ id }) => {
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

        // Find the todo by ID
        const todoItem = await todo.findById(id);
        if (!todoItem) {
            return {
                status: "error",
                message: "Todo not found"
            };
        }

        // Toggle 'done' status
        todoItem.done = !todoItem.done;
        todoItem.updatedAt = new Date(); // Update timestamp
        await todoItem.save();

        return {
            status: "success",
            message: "Todo status updated",
            data: {
                id: todoItem._id.toString(),
                task: todoItem.task,
                done: todoItem.done
            }
        };
    } catch (error) {
        return {
            status: "error",
            message: error.message
        };
    }
};




module.exports = { getalltodos, createtodo, searchtodo, deletetodo, toggletodo };