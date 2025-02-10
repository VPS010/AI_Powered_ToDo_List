const { GoogleGenerativeAI } = require("@google/generative-ai");
const todoTools = require("../tools/aiTools");
const SYSTEM_PROMPT = require("../tools/sysPrompt");
const readline = require("readline");
const validTools = ['getalltodos', 'createtodo', 'searchtodo', 'deletetodo', 'toggletodo'];

class TodoAIChat {

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.initializeModel();
        this.tools = this.setupTools();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    initializeModel() {
        return this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash-002",
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE",
                },
            ],
        });
    }

    setupTools() {
        return [
            {
                functionDeclarations: [
                    {
                        name: "getalltodos",
                        description: "Retrieve all todo items",
                    },
                    {
                        name: "createtodo",
                        description: "Create a new todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                todoText: {
                                    type: "string",
                                    description: "The text content of the todo item",
                                },
                            },
                            required: ["todoText"],
                        },
                    },
                    {
                        name: "searchtodo",
                        description: "Search todo items",
                        parameters: {
                            type: "object",
                            properties: {
                                search: {
                                    type: "string",
                                    description: "Search query string",
                                },
                            },
                            required: ["search"],
                        },
                    },
                    {
                        name: "deletetodo",
                        description: "Delete a todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "MongoDB _id of the todo to delete",
                                },
                            },
                            required: ["id"],
                        },
                    },
                    {
                        name: "toggletodo",
                        description: "Toggle the completion status of a todo item",
                        parameters: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "MongoDB _id of the todo to toggle",
                                },
                            },
                            required: ["id"],
                        },
                    },
                ],
            },
        ];
    }

    createObservation(toolName, result) {
        const observations = {
            getalltodos: {
                type: "observation",
                content: {
                    source: "getalltodos",
                    count: result.data?.length || 0,
                    todos: result.data || []
                }
            },
            toggletodo: {
                type: "observation",
                content: {
                    source: "toggletodo",
                    todo: result.data || {}
                }
            },
            createtodo: {
                type: "observation",
                content: {
                    source: "createtodo",
                    createdId: result.data?.id || 'unknown'
                }
            },
            deletetodo: {
                type: "observation",
                content: {
                    source: "deletetodo",
                    deletedId: result.data?.id || 'unknown'
                }
            }
        };

        return observations[toolName] || {
            type: "observation",
            content: result
        };
    }

    sanitizeResult(result) {
        // Handle array results
        if (result.data && Array.isArray(result.data)) {
            return {
                ...result,
                data: result.data.map(item => ({
                    ...item,
                    _id: item._id ? item._id.toString() : 'invalid-id',
                    createdAt: new Date(item.createdAt).toISOString(),
                    updatedAt: new Date(item.updatedAt).toISOString()
                }))
            };
        }

        // Handle single object results
        if (result.data && typeof result.data === 'object') {
            return {
                ...result,
                data: {
                    ...result.data,
                    _id: result.data._id ? result.data._id.toString() : 'invalid-id',
                    createdAt: new Date(result.data.createdAt).toISOString(),
                    updatedAt: new Date(result.data.updatedAt).toISOString()
                }
            };
        }

        return result;
    }


    async getUserInput(query) {
        return new Promise((resolve) => {
            this.rl.question(query, (answer) => {
                process.stdout.moveCursor(0, -1);
                resolve(answer);
            });
        });
    }

    startNewChat() {
        return this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text:
                                "System: Initialize with the following configuration:" +
                                SYSTEM_PROMPT,
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: JSON.stringify({
                                type: "start",
                                content: {
                                    status: "initialized",
                                    message:
                                        "Ready to help with todos in a sarcastic way!",
                                },
                            }),
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.9,
            },
            tools: this.tools,
        });
    }

    async handleFunctionCall(chat, name, args) {
        console.log(`⚙️ Calling function: ${name}`, args);
        try {
            if (!validTools.includes(name)) {
                throw new Error(`Invalid function call: ${name}`);
            }

            const result = await todoTools[name](args);
            console.log(`✅ Function result:`, result);

            // Convert MongoDB data to plain objects
            const sanitizedResult = this.sanitizeResult(result);

            // Create observation message
            const observation = this.createObservation(name, sanitizedResult);

            // Send observation to continue conversation
            const response = await chat.sendMessage([{
                text: JSON.stringify(observation)
            }]);

            return response;
        } catch (error) {
            console.error(`❌ Function error:`, error);
            await chat.sendMessage([{
                text: JSON.stringify({
                    type: "error",
                    content: { message: error.message }
                })
            }]);
            throw error;
        }
    }

    sanitizeResult(result) {
        if (result.data && Array.isArray(result.data)) {
            return {
                ...result,
                data: result.data.map(item => ({
                    ...item,
                    _id: item._id.toString(),
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString()
                }))
            };
        }
        return result;
    }


    async handleToolCall(toolName, parameters) {
        console.log(`⚙️ Calling function: ${toolName}`, parameters);
        try {
            const result = await todoTools[toolName](parameters);
            console.log(`✅ Function result:`, result);
            return result;
        } catch (error) {
            console.error(`❌ Function error:`, error);
            return { status: 'error', message: error.message };
        }
    }

    async processResponse(chat, response) {
        let finalOutput = '';
        let requiresUpdate = false;

        try {
            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.text) {
                    const parsedResponses = this.parseResponse(part.text);
                    for (const parsed of parsedResponses) {
                        await this.handleResponseTypes(parsed);

                        if (parsed.type === "action" && parsed.content.tool) {
                            try {
                                await this.handleFunctionCall(
                                    chat,
                                    parsed.content.tool,
                                    parsed.content.parameters
                                );
                                requiresUpdate = true;
                            } catch (error) {
                                console.error('Function call failed:', error);
                                finalOutput = "Oops! That action failed. Maybe try a different approach?";
                            }
                        }

                        if (parsed.type === "output") {
                            finalOutput = parsed.content.message;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('🚨 Response Processing Error:', error);
            finalOutput = "Yikes! Something went sideways. Maybe try a different approach?";
        }

        return { finalOutput, requiresUpdate };
    }


    async processUserInput(input, history) {
        try {
            const chat = await this.createNewChat(history);
            const result = await chat.sendMessage([{
                text: JSON.stringify({
                    type: "user_input",
                    content: { message: input }
                })
            }]);

            const response = await this.processResponse(chat, result.response);
            return {
                message: response.finalOutput,
                requiresUpdate: response.requiresUpdate
            };

        } catch (error) {
            console.error("Processing error:", error);
            return {
                message: "Let me try that again... What was that you wanted?",
                requiresUpdate: false
            };
        }
    }


    async createNewChat(history) {
        // Convert stored history to proper role structure
        const rebuiltHistory = history.map(msg => ({
            role: msg.role === "ai" ? "model" : msg.role, // Convert 'ai' to 'model'
            parts: [{ text: msg.content }]
        }));

        return this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System: ${SYSTEM_PROMPT}` }]
                },
                {
                    role: "model",
                    parts: [{ text: JSON.stringify({ type: "start", content: { status: "initialized" } }) }]
                },
                ...rebuiltHistory
            ],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.9 },
            tools: this.tools
        });
    }

    parseResponse(text) {
        try {
            // Remove code fence markers
            let cleanedText = text.replace(/```(json)?/g, "").trim();

            // Match all JSON objects
            const regex = /\{[\s\S]*?\}(?=\s*\{|\s*$)/g;
            const matches = cleanedText.match(regex);

            if (matches) {
                const results = [];
                for (const jsonString of matches) {
                    try {
                        results.push(JSON.parse(jsonString));
                    } catch (error) {
                        console.error(
                            "Failed to parse JSON block:",
                            jsonString,
                            error
                        );
                    }
                }
                return results;
            }

            console.error("No JSON blocks found in response:", text);
            return {
                type: "error",
                content: { message: "Invalid response format" },
            };
        } catch (error) {
            console.error("Failed to parse response:", text, error);
            return {
                type: "error",
                content: { message: "Invalid response format" },
            };
        }
    }

    async handleResponseTypes(response) {
        switch (response.type) {
            case "plan":
                console.log("📝 Plan:", response.content.description);
                break;
            case "action":
                console.log("🛠️ Action Required:", response.content.tool);
                break;
            case "observation":
                console.log("🔍 Full Observation:", response.content);

                if (response.content.source === "getalltodos") {
                    // Directly generate output from data
                    const count = response.content.count;
                    const tasks = response.content.todos.map(t => `- ${t.task}`).join('\n');

                    console.log(`💬 Final Response: You have ${count} todos:\n${tasks}`);
                } else if (response.content.source === "toggletodo") {
                    const status = response.content.todo.done ? "completed" : "uncompleted";
                    console.log(`💬 Final Response: Todo "${response.content.todo.task}" marked as ${status}`);
                }
                break;
            case "output":
                console.log(
                    `💬 Final Response: ${response.content.message}`
                );
                break;
            case "error":
                console.error(
                    "❌ Error:",
                    response.content.error || response.content.message
                );
                break;
            default:
                console.log("Received:", response);
        }
    }

    async startInteractiveLoop() {
        console.log("Loop Started");
        let chat = await this.startNewChat();
        while (true) {
            try {
                const query = await this.getUserInput(">> ");
                if (!query || query.toLowerCase() === "exit") {
                    this.rl.close();
                    break;
                }
                const result = await chat.sendMessage([
                    {
                        text: JSON.stringify({
                            type: "user_input",
                            content: { message: query },
                        }),
                    },
                ]);
                await this.processResponse(chat, result.response);
            } catch (error) {
                console.error("🚨 Error:", error);
                if (
                    error.message &&
                    error.message.includes("SAFETY")
                ) {
                    console.log("⚠️ Content blocked by safety filters");
                }
            }
        }
    }
}


module.exports = { TodoAIChat }