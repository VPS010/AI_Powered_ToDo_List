const { GoogleGenerativeAI } = require("@google/generative-ai");
const todoTools = require("../tools/aiTools");
const SYSTEM_PROMPT = require("../tools/sysPrompt");
const readline = require("readline");

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
            const result = await todoTools[name](args);
            console.log(`✅ Function result:`, result);
            const functionResponsePart = {
                functionResponse: {
                    name: name,
                    response: {
                        content: result,
                    },
                },
            };
            const response = await chat.sendMessage([functionResponsePart]);
            return response;
        } catch (error) {
            console.error(`❌ Function error:`, error);
            const errorPart = {
                text: JSON.stringify({
                    type: "error",
                    content: { error: error.message || "Unknown error" },
                }),
            };
            await chat.sendMessage([errorPart]);
            throw error;
        }
    }

    async processResponse(chat, response) {
        if (!response.candidates?.[0]?.content?.parts) return;

        for (const part of response.candidates[0].content.parts) {
            try {
                if (part.text) {
                    const parsedResponses = this.parseResponse(part.text);
                    const responsesArray = Array.isArray(parsedResponses)
                        ? parsedResponses
                        : [parsedResponses];

                    for (const parsed of responsesArray) {
                        if (
                            parsed.type === "action" &&
                            parsed.content.tool
                        ) {
                            console.log(
                                "Detected action:",
                                parsed.content.tool
                            );
                            const result = await todoTools[
                                parsed.content.tool
                            ](parsed.content.parameters || {});
                            console.log("Tool result:", result);

                            // Modify this section in processResponse()
                            // In the getalltodos handling block:
                            if (parsed.content.tool === "getalltodos" && result.status === "success") {
                                // Convert to plain objects with string dates
                                const sanitizedData = result.data.map(item => ({
                                    ...item,
                                    createdAt: new Date(item.createdAt).toISOString(),
                                    updatedAt: new Date(item.updatedAt).toISOString()
                                }));

                                // Send FULL observation with explicit count
                                const obsResponse = await chat.sendMessage([{
                                    text: JSON.stringify({
                                        type: "observation",
                                        content: {
                                            source: "getalltodos",
                                            count: sanitizedData.length,
                                            todos: sanitizedData // Send full array
                                        }
                                    })
                                }]);

                                // Process AI's response to the observation
                                await this.processResponse(chat, obsResponse.response);


                                continue;
                            }

                            if (parsed.content.tool === "toggletodo" && result.status === "success") {
                                const obsResponse = await chat.sendMessage([{
                                    text: JSON.stringify({
                                        type: "observation",
                                        content: {
                                            source: "toggletodo",
                                            message: result.message,
                                            todo: {
                                                id: result.data.id,
                                                task: result.data.task,
                                                done: result.data.done
                                            }
                                        }
                                    })
                                }]);
                                await this.processResponse(chat, obsResponse.response);
                                continue;
                            }

                            if (
                                parsed.content.tool === "searchtodo" &&
                                result.status === "success"
                            ) {
                                const obsResponse = await chat.sendMessage([
                                    {
                                        text: JSON.stringify({
                                            type: "observation",
                                            content: {
                                                id: result.data._id,
                                                result: result.data,
                                            },
                                        }),
                                    },
                                ]);
                                await this.processResponse(chat, obsResponse.response);
                                continue;
                            }

                            if (parsed.content.tool === "deletetodo") {
                                const deleteResult = await todoTools.deletetodo({
                                    id: result.data._id,
                                });
                                const obsResponse = await chat.sendMessage([
                                    {
                                        text: JSON.stringify({
                                            type: "observation",
                                            content: {
                                                message: deleteResult.message,
                                            },
                                        }),
                                    },
                                ]);
                                await this.processResponse(chat, obsResponse.response);
                                continue;
                            }
                        }
                        await this.handleResponseTypes(parsed);
                    }
                }
            } catch (error) {
                console.error("🚨 Response Processing Error:", error);
            }
        }
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