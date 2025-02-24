const { GoogleGenerativeAI } = require("@google/generative-ai");
const todoTools = require("../tools/aiTools");
const SYSTEM_PROMPT = require("../tools/sysPrompt");

const validTools = ['getalltodos', 'createtodo', 'searchtodo', 'deletetodo', 'toggletodo'];

class TodoAIChat {

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.initializeModel();
        this.tools = this.setupTools();
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
                    deletedId: result.data || 'unknown'
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
                    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined
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
                    createdAt: result.data.createdAt ? new Date(result.data.createdAt).toISOString() : undefined,
                    updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt).toISOString() : undefined
                }
            };
        }

        return result;
    }

    async handleFunctionCall(chat, name, args) {
        console.log(`⚙️ Calling function: ${name}`, args); // for debugging
        try {
            if (!validTools.includes(name)) {
                throw new Error(`Invalid function call: ${name}`);
            }

            const result = await todoTools[name](args);
            console.log(`✅ Function result:`, result);  // for debugging

            // Convert MongoDB data to plain objects
            const sanitizedResult = this.sanitizeResult(result);

            // Create observation message
            const observation = this.createObservation(name, sanitizedResult);

            // Validate observation
            if (!observation || typeof observation !== 'object') {
                throw new Error("Invalid observation generated");
            }

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

    async processResponse(chat, response, onPartialResponse) {
        let finalOutput = '';
        let requiresUpdate = false;

        try {
            const processPart = async (part) => {
                if (part.text) {
                    const parsedResponses = this.parseResponse(part.text);
                    for (const parsed of parsedResponses) {
                        // Handle immediate responses
                        if (parsed.type === "output") {
                            finalOutput = parsed.content.message;
                            onPartialResponse?.(parsed.content);
                            requiresUpdate = true;
                        }

                        // Handle function calls
                        if (parsed.type === "action" && parsed.content.tool) {
                            const result = await this.handleFunctionCall(
                                chat,
                                parsed.content.tool,
                                parsed.content.parameters
                            );
                            requiresUpdate = true;

                            // Process subsequent responses recursively
                            if (result && result.response) {
                                const subResponse = await this.processResponse(
                                    chat,
                                    result.response,
                                    onPartialResponse
                                );
                                finalOutput = subResponse.finalOutput || finalOutput;
                            }
                        }
                    }
                }
            };

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                await processPart(part);
            }

        } catch (error) {
            console.error('🚨 Response Processing Error:', error);
            finalOutput = "Yikes! Something went sideways. Maybe try a different approach?";
        }

        return { finalOutput, requiresUpdate };
    }

    async processUserInput(input, history) {
        // Validate input
        if (!input || typeof input !== 'string' || input.trim() === '') {
            console.error("Invalid input: input must be a non-empty string");
            return {
                message: "Please provide a valid input.",
                requiresUpdate: false
            };
        }
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
            role: msg.role,
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
            // Validate input text
            if (!text || typeof text !== 'string' || text.trim() === '') {
                console.error("Empty or invalid response text");
                return [{
                    type: "error",
                    content: { message: "Empty response received" }
                }];
            }

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
                        console.error("Failed to parse JSON block:", jsonString, error);
                    }
                }
                return results.length > 0 ? results : [{
                    type: "error",
                    content: { message: "No valid JSON found in response" }
                }];
            }

            console.error("No JSON blocks found in response:", text);
            return [{
                type: "error",
                content: { message: "Invalid response format" }
            }];
        } catch (error) {
            console.error("Failed to parse response:", text, error);
            return [{
                type: "error",
                content: { message: "Invalid response format" }
            }];
        }
    }
}

module.exports = { TodoAIChat }