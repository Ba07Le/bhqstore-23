const OpenAI = require("openai");
const Product = require("../models/Product");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Map user keywords to product tags
const tagMappings = {
    'gaming': ['gaming'],
    'văn phòng': ['office'],
    'office': ['office'],
    'công việc': ['office', 'professional'],
    'chuyên nghiệp': ['professional'],
    'streamer': ['professional', 'gaming'],
    'designer': ['professional', 'premium'],
    'rẻ': ['budget'],
    'giá rẻ': ['budget'],
    'ngân sách': ['budget'],
    'cao cấp': ['premium'],
    'premium': ['premium'],
    'luxury': ['premium'],
    'không dây': ['wireless'],
    'wireless': ['wireless'],
    'có dây': ['wired'],
    'wired': ['wired'],
    'rgb': ['rgb'],
    'đèn': ['rgb'],
    'cơ': ['mechanical'],
    'mechanical': ['mechanical'],
    'chống ồn': ['noise-cancelling'],
    'noise cancelling': ['noise-cancelling'],
    'chặn tiếng ồn': ['noise-cancelling'],
    'studio': ['studio'],
    'chuyên dùng': ['studio', 'professional'],
    'mang theo': ['portable'],
    'portable': ['portable'],
    'di động': ['portable']
};

function extractTags(query) {
    const queryLower = query.toLowerCase();
    const foundTags = new Set();

    for (const [keyword, tags] of Object.entries(tagMappings)) {
        if (queryLower.includes(keyword)) {
            tags.forEach(tag => foundTags.add(tag));
        }
    }

    return Array.from(foundTags);
}

exports.handleChat = async (req, res) => {
    let foundProducts = [];
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
                            console.error("❌ JSON parse failed:", e.message);
                            foundProducts = formattedResults;
                            return { tool_call_id: call.id, 
                            output: JSON.stringify(formattedResults) };
                        }

                        const query = args.query || args.search_query || args.keyword || Object.values(args)[0];
                        const minPrice = args.minPrice || 0;
                        const maxPrice = args.maxPrice || Number.MAX_SAFE_INTEGER;

                        console.log("🔍 Search query:", query, `| Price range: ${minPrice}-${maxPrice}`);

                        if (!query || String(query).trim() === "") {
                            return { tool_call_id: call.id, output: JSON.stringify([]) };
                        }

                        // ✅ CATEGORY RESTRICTION: Only allow headphone, mouse, keyboard
                        const allowedKeywords = ['tai nghe', 'headphone', 'chuột', 'mouse', 'bàn phím', 'keyboard'];
                        const queryLower = String(query).trim().toLowerCase();
                        
                        const isAllowedProduct = allowedKeywords.some(keyword => queryLower.includes(keyword));
                        
                        if (!isAllowedProduct) {
                            console.log("⚠️ Category not allowed:", query);
                            
                            return { 
                                tool_call_id: call.id, 
                                output: JSON.stringify([{ 
                                    error: "❌ Hiện tại BHQ Store chỉ bán: 🎧 Tai nghe, 🖱️ Chuột, ⌨️ Bàn phím. Vui lòng chọn một trong ba danh mục này!"
                                }]) 
                            };
                        }

                        // ✅ Extract tags from query to help filter products
                        const extractedTags = extractTags(queryLower);
                        console.log("🏷️ Extracted tags:", extractedTags);

                        const emb = await openai.embeddings.create({
                            model: "text-embedding-3-small",
                            input: String(query).trim()
                        });

                        // Build match query with tags if any are extracted
                        const matchQuery = {
                            "price": { "$gte": minPrice, "$lte": maxPrice },
                            "isDeleted": false
                        };

                        // If tags were extracted, filter by tags
                        if (extractedTags.length > 0) {
                            matchQuery["tags"] = { "$in": extractedTags };
                        }

                        const results = await Product.aggregate([
                            {
                                "$vectorSearch": {
                                    "index": "product",
                                    "path": "description_vector",
                                    "queryVector": emb.data[0].embedding,
                                    "numCandidates": 150,
                                    "limit": 10
                                }
                            },
                            {
                                "$match": matchQuery
                            },
                            {
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
                                    "tags": 1,
                                    "averageRating": { "$avg": "$customerReviews.rating" },
                                    "totalReviews": { "$size": "$customerReviews" },
                                    "topComments": { "$slice": ["$customerReviews.comment", 2] }
                                }
                            },
                            {
                                // Sort by rating descending to show best products first
                                "$sort": { "averageRating": -1 }
                            }
                        ]);

                        // Map tags to emojis for display
                        const tagEmojis = {
                            'gaming': '🎮',
                            'office': '💼',
                            'professional': '👔',
                            'budget': '💰',
                            'premium': '💎',
                            'wireless': '📡',
                            'wired': '🔌',
                            'rgb': '🌈',
                            'mechanical': '⌨️',
                            'noise-cancelling': '🔇',
                            'portable': '🎒',
                            'studio': '🎙️'
                        };

                        const formattedResults = results.map(p => {
                            const tagEmojisStr = p.tags
                                .map(tag => `${tagEmojis[tag] || '🏷️'} ${tag}`)
                                .join(', ');

                            return {
                                id: p._id.toString(),
                                name: p.title,
                                price: `${p.price} USD`,
                                thumbnail: p.thumbnail,
                                tags: p.tags,
                                tagsDisplay: tagEmojisStr || "Không có tag",
                                rating: p.averageRating ? `${p.averageRating.toFixed(1)}/5` : "Chưa có đánh giá",
                                review_count: p.totalReviews,
                                highlights: p.topComments.join(" | ") || "Không có nhận xét",
                                quality_info: p.description,
                                availability: p.stockQuantity > 0 ? "Còn hàng ✅" : "Hết hàng ❌"
                            };
                        });
                        foundProducts = formattedResults; // ← make sure this line exists
                        
                        console.log(`✨ Found ${formattedResults.length} products for: "${query}" with tags: ${extractedTags.join(', ')}`);
                        console.log("✅ foundProducts set:", foundProducts.length);
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

        // 6. ✅ STRICTLY CHECK: Only parse ADD_TO_CART if user EXPLICITLY asked to add to cart
        let cartAction = null;
        const actionMatch = lastMessage.match(/\[ACTION:\s*ADD_TO_CART\((.*?)\)\]/);
        
        if (actionMatch) {
            const productId = actionMatch[1].trim();
            
            // ✅ Verify the user message contains explicit purchase keywords
            const userMessage = message.toLowerCase();
            const addToCartKeywords = ['thêm', 'lấy', 'chốt', 'mua', 'add to cart', 'thêm vào giỏ', 'ghi nhận', 'lấy cái này', 'mua ngay', 'được', 'ok', 'vâng'];
            
            const shouldAddToCart = addToCartKeywords.some(keyword => userMessage.includes(keyword));
            
            if (shouldAddToCart) {
                console.log("🛒 AI triggered ADD_TO_CART for product:", productId);
                cartAction = { type: "ADD_TO_CART", productId };
            } else {
                console.log("⚠️ AI returned ADD_TO_CART tag but user didn't explicitly request it - ignoring");
            }
        }
        console.log("✅ Sending products count:", foundProducts.length); 
        res.status(200).json({
            reply: lastMessage,
            threadId: threadId,
            cartAction,
            products: foundProducts 
        });

    } catch (error) {
        console.error("❌ AI Error:", error.message);
        res.status(500).json({
            error: "An error occurred with the AI assistant.",
            details: error.message
        });
    }
};