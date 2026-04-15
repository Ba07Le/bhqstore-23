const OpenAI = require("openai");
const Product = require("../models/Product");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChat = async (req, res) => {
    let { message, threadId } = req.body;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    console.log("📥 Incoming Request:", { message, threadId });

    try {
        // 1. Validate or Create Thread
        if (!threadId || threadId === "undefined" || threadId === "") {
            console.log("🧵 No threadId provided. Creating new thread...");
            const newThread = await openai.beta.threads.create();
            threadId = newThread.id;
        }
        console.log("✅ Using Thread ID:", threadId);

        // 2. Add User Message to Thread
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });

        // 3. Start the Run
        const createdRun = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId
        });
        const runId = createdRun.id;
        console.log("🚀 Run Started ID:", runId);

        // 4. Polling Loop with retry on rate limit
        let run = createdRun;
        let runStatus = run.status;
        let attempts = 0;
        const maxAttempts = 120;
        let currentRunId = runId;

        while (runStatus !== "completed" && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            attempts++;

            run = await openai.beta.threads.runs.retrieve(threadId, currentRunId);
            runStatus = run.status;
            console.log(`⏳ [${attempts}] Status: ${runStatus} | Thread: ${threadId} | Run: ${currentRunId}`);

            // Handle tool calls (vector search)
            if (runStatus === "requires_action") {
                console.log("🔍 AI requesting tool: search_db");

                const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
                const toolOutputs = await Promise.all(toolCalls.map(async (call) => {
                    if (call.function.name === "search_db") {
                        // ✅ Debug logs to see exactly what AI is sending
                        console.log("🔍 RAW function arguments:", call.function.arguments);
                        console.log("🔍 typeof arguments:", typeof call.function.arguments);

                        let args;
                        try {
                            args = JSON.parse(call.function.arguments);
                        } catch (e) {
                            console.error("❌ Failed to parse arguments:", e.message);
                            return { tool_call_id: call.id, output: JSON.stringify([]) };
                        }

                        console.log("🔍 Parsed args:", args);
                        console.log("🔍 Args keys:", Object.keys(args));

                        // Handle any key name the AI might use
                        const query = args.query || args.Query || args.search_query || args.keyword || Object.values(args)[0];
                        console.log("🔍 Final query value:", query);
                        console.log("🔍 Query type:", typeof query);

                        if (!query || String(query).trim() === "") {
                            console.error("❌ Empty query — returning empty results");
                            return { tool_call_id: call.id, output: JSON.stringify([]) };
                        }

                        const emb = await openai.embeddings.create({
                            model: "text-embedding-3-small",
                            input: String(query).trim()
                        });

                        const results = await Product.aggregate([
                            {
                                "$vectorSearch": {
                                    "index": "product",
                                    "path": "description_vector",
                                    "queryVector": emb.data[0].embedding,
                                    "numCandidates": 100,
                                    "limit": 3
                                }
                            },
                            { "$project": { "title": 1, "price": 1, "description": 1, "thumbnail": 1, "_id": 1 } }
                        ]);

                        console.log(`✨ Found ${results.length} products for: "${query}"`);
                        return {
                            tool_call_id: call.id,
                            output: JSON.stringify(results)
                        };
                    }
                }));

                await openai.beta.threads.runs.submitToolOutputs(threadId, currentRunId, {
                    tool_outputs: toolOutputs
                });
            }

            // Handle failed run
            if (runStatus === "failed") {
                const errorMsg = run.last_error?.message || "";
                console.error("❌ Run failed. Last error:", JSON.stringify(run.last_error, null, 2));

                // Auto-retry on rate limit
                if (errorMsg.includes("rate_limit_exceeded")) {
                    console.log("⏳ Rate limited — waiting 10s before retry...");
                    await openai.beta.threads.runs.cancel(threadId, currentRunId).catch(() => {});
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    const retryRun = await openai.beta.threads.runs.create(threadId, {
                        assistant_id: assistantId
                    });
                    currentRunId = retryRun.id;
                    run = retryRun;
                    runStatus = run.status;
                    console.log("🔄 Retry Run ID:", currentRunId);
                    continue;
                }

                throw new Error(`Run failed: ${errorMsg || "Unknown error"}`);
            }

            if (runStatus === "cancelled" || runStatus === "expired") {
                throw new Error(`Run ended with status: ${runStatus}`);
            }
        }

        if (attempts >= maxAttempts) {
            throw new Error("Run timed out after 120 attempts");
        }

        // 5. Get Final Response
        const messages = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0].content[0].text.value;
        console.log("📨 Raw AI reply:", lastMessage);

        // 6. Parse ACTION tag on backend
        let cartAction = null;
        const actionMatch = lastMessage.match(/\[ACTION:\s*ADD_TO_CART\((.*?)\)\]/);
        if (actionMatch) {
            const productId = actionMatch[1].trim();
            console.log("🛒 AI triggered add to cart for product:", productId);
            cartAction = { type: "ADD_TO_CART", productId };
        }

        res.status(200).json({
            reply: lastMessage,
            threadId: threadId,
            cartAction
        });

    } catch (error) {
        console.error("❌ AI Error:", error.message);
        res.status(500).json({
            error: "An error occurred with the AI assistant.",
            details: error.message
        });
    }
};