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
    let args;
    try {
        args = JSON.parse(call.function.arguments);
    } catch (e) {
        return { tool_call_id: call.id, output: JSON.stringify([]) };
    }

    const query = args.query || args.search_query || Object.values(args)[0];
    // Lấy thêm các tham số về giá nếu AI trích xuất được (Ví dụ: {minPrice: 10, maxPrice: 50})
    const minPrice = args.minPrice || 0;
    const maxPrice = args.maxPrice || Number.MAX_SAFE_INTEGER;

    const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: String(query).trim()
    });

    const results = await Product.aggregate([
        {
            "$vectorSearch": {
                "index": "product", // Tên index của bạn trên Atlas
                "path": "description_vector",
                "queryVector": emb.data[0].embedding,
                "numCandidates": 100,
                "limit": 5 // Lấy 5 sp để có dữ liệu so sánh/đề xuất
            }
        },
        {
            // Lọc theo khoảng giá nếu có yêu cầu
            "$match": {
                "price": { "$gte": minPrice, "$lte": maxPrice },
                "isDeleted": false
            }
        },
        {
            // Kết nối với collection reviews (tên collection thường là 'reviews')
            "$lookup": {
                "from": "reviews",
                "localField": "_id",
                "foreignField": "product",
                "as": "customerReviews"
            }
        },
        {
            "$project": {
                "title": 1,
                "price": 1,
                "description": 1,
                "thumbnail": 1,
                "stockQuantity": 1,
                // Tính toán thông tin cho việc so sánh chất lượng
                "averageRating": { "$avg": "$customerReviews.rating" },
                "totalReviews": { "$size": "$customerReviews" },
                "topComments": { "$slice": ["$customerReviews.comment", 2] } // Lấy 2 nhận xét tiêu biểu
            }
        }
    ]);

    // Format lại output để AI dễ đọc và so sánh
    const formattedResults = results.map(p => ({
        id: p._id,
        name: p.title,
        price: `${p.price} USD`,
        rating: p.averageRating ? `${p.averageRating.toFixed(1)}/5` : "Chưa có đánh giá",
        review_count: p.totalReviews,
        highlights: p.topComments.join(" | "),
        quality_info: p.description, // AI sẽ tự đọc specs trong này để so sánh
        availability: p.stockQuantity > 0 ? "Còn hàng" : "Hết hàng"
    }));

    return {
        tool_call_id: call.id,
        output: JSON.stringify(formattedResults)
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