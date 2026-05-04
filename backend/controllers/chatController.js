const OpenAI = require("openai");
const Product = require("../models/Product");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

const tagEmojis = {
    'gaming': '🎮', 'office': '💼', 'professional': '👔',
    'budget': '💰', 'premium': '💎', 'wireless': '📡',
    'wired': '🔌', 'rgb': '🌈', 'mechanical': '⌨️',
    'noise-cancelling': '🔇', 'portable': '🎒', 'studio': '🎙️'
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

//Cache embeddings to avoid duplicate API calls
const embeddingCache = new Map();

async function getEmbedding(text) {
    if (embeddingCache.has(text)) {
        console.log("⚡ Cache hit for embedding:", text);
        return embeddingCache.get(text);
    }
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text
    });
    const embedding = response.data[0].embedding;
    // Keep cache small — max 50 entries
    if (embeddingCache.size >= 50) {
        embeddingCache.delete(embeddingCache.keys().next().value);
    }
    embeddingCache.set(text, embedding);
    return embedding;
}

async function searchProducts(query, minPrice, maxPrice) {
    const queryLower = String(query).trim().toLowerCase();
    const extractedTags = extractTags(queryLower);
    console.log("🏷️ Extracted tags:", extractedTags);

    //Run embedding in parallel with building matchQuery
    const [embedding] = await Promise.all([
        getEmbedding(queryLower)
    ]);

    const matchQuery = {
        "price": { "$gte": minPrice, "$lte": maxPrice },
        "isDeleted": false
    };
    if (extractedTags.length > 0) {
        matchQuery["tags"] = { "$in": extractedTags };
    }

    const results = await Product.aggregate([
        {
            "$vectorSearch": {
                "index": "product",
                "path": "description_vector",
                "queryVector": embedding,
                "numCandidates": 50,  
                "limit": 8           
            }
        },
        { "$match": matchQuery },
        {
            "$lookup": {
                "from": "reviews",
                "localField": "_id",
                "foreignField": "product",
                "as": "customerReviews"
            }
        },
        {
            "$lookup": {
                "from": "brands",
                "localField": "brand",
                "foreignField": "_id",
                "as": "brandInfo"
            }
        },
        {
            "$project": {
                "title": 1, "price": 1, "description": 1,
                "thumbnail": 1, "stockQuantity": 1, "tags": 1, "specifications": 1,
                "brand": { "$arrayElemAt": ["$brandInfo", 0] },
                "averageRating": { "$avg": "$customerReviews.rating" },
                "totalReviews": { "$size": "$customerReviews" },
                "topComments": { "$slice": ["$customerReviews.comment", 2] }
            }
        },
        { "$sort": { "averageRating": -1 } }
    ]);

    return results.map(p => {
        const tagEmojisStr = (p.tags || [])
            .map(tag => `${tagEmojis[tag] || '🏷️'} ${tag}`)
            .join(', ');
        const specsText = p.specifications?.length > 0
            ? p.specifications.map(s => `${s.key}: ${s.value}`).join(' | ')
            : 'Không có thông số';

        return {
            id: p._id.toString(),
            name: p.title,
            price: `${p.price} USD`,
            thumbnail: p.thumbnail,
            tags: p.tags,
            brand: p.brand || null,
            tagsDisplay: tagEmojisStr || "Không có tag",
            rating: p.averageRating ? `${p.averageRating.toFixed(1)}/5` : "Chưa có đánh giá",
            review_count: p.totalReviews,
            highlights: p.topComments?.join(" | ") || "Không có nhận xét",
            quality_info: p.description,
            availability: p.stockQuantity > 0 ? "Còn hàng ✅" : "Hết hàng ❌",
            specifications: p.specifications || [],
            specificationsText: specsText
        };
    });
}

async function pollRun(threadId, runId) {
    const intervals = [500, 500, 800, 800, 1000, 1000, 1200, 1200, 1500];
    let attempt = 0;
    const maxAttempts = 40;

    while (attempt < maxAttempts) {
        const delay = intervals[Math.min(attempt, intervals.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;

        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        console.log(`[${attempt}] Status: ${run.status} (waited ${delay}ms)`);

        if (run.status === "completed") return { run, status: "completed" };
        if (run.status === "requires_action") return { run, status: "requires_action" };
        if (run.status === "failed") return { run, status: "failed" };
        if (run.status === "cancelled" || run.status === "expired") {
            return { run, status: run.status };
        }
    }
    return { run: null, status: "timeout" };
}

exports.handleChat = async (req, res) => {
    let foundProducts = [];
    let { message, threadId } = req.body;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    console.log("Incoming:", { message, threadId });

    try {
        // 1. Create thread if needed
        if (!threadId || threadId === "undefined" || threadId === "") {
            const newThread = await openai.beta.threads.create();
            threadId = newThread.id;
            console.log("🧵 New Thread:", threadId);
        }

        // 2. Add message + start run in parallel
        const [, createdRun] = await Promise.all([
            openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: message
            }),
            openai.beta.threads.runs.create(threadId, {
                assistant_id: assistantId
            })
        ]);

        console.log("Run Started:", createdRun.id);

        let currentRunId = createdRun.id;
        let completed = false;
        let lastMessage = null;

        // 3. Main loop
        while (!completed) {
            const { run, status } = await pollRun(threadId, currentRunId);

            if (status === "timeout") throw new Error("Run timed out");
            if (status === "cancelled" || status === "expired") throw new Error(`Run ended: ${status}`);

            if (status === "failed") {
                const errorMsg = run.last_error?.message || "";
                if (errorMsg.includes("rate_limit_exceeded")) {
                    console.log("Rate limited — retrying in 10s...");
                    await openai.beta.threads.runs.cancel(threadId, currentRunId).catch(() => {});
                    await new Promise(r => setTimeout(r, 10000));
                    const retryRun = await openai.beta.threads.runs.create(threadId, {
                        assistant_id: assistantId
                    });
                    currentRunId = retryRun.id;
                    continue;
                }
                throw new Error(`Run failed: ${errorMsg}`);
            }

            if (status === "requires_action") {
                console.log("Tool call required");
                const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

                const toolOutputs = await Promise.all(toolCalls.map(async (call) => {
                    if (call.function.name !== "search_db") {
                        return { tool_call_id: call.id, output: JSON.stringify([]) };
                    }

                    let args;
                    try {
                        args = JSON.parse(call.function.arguments);
                    } catch (e) {
                        return { tool_call_id: call.id, output: JSON.stringify([]) };
                    }

                    const query = args.query || args.search_query || args.keyword || Object.values(args)[0];
                    const minPrice = args.minPrice || 0;
                    const maxPrice = args.maxPrice || Number.MAX_SAFE_INTEGER;

                    if (!query || String(query).trim() === "") {
                        return { tool_call_id: call.id, output: JSON.stringify([]) };
                    }

                    const queryLower = String(query).trim().toLowerCase();
                    const allowedKeywords = ['tai nghe', 'headphone', 'chuột', 'mouse', 'bàn phím', 'keyboard'];
                    const isAllowed = allowedKeywords.some(k => queryLower.includes(k));

                    if (!isAllowed) {
                        return {
                            tool_call_id: call.id,
                            output: JSON.stringify([{
                                error: "BHQ Store chỉ bán: Tai nghe, Chuột, Bàn phím."
                            }])
                        };
                    }

                    console.log("Searching:", query);
                    const products = await searchProducts(query, minPrice, maxPrice);
                    foundProducts = products;
                    console.log(`Found ${products.length} products`);

                    return {
                        tool_call_id: call.id,
                        output: JSON.stringify(products)
                    };
                }));

                await openai.beta.threads.runs.submitToolOutputs(threadId, currentRunId, {
                    tool_outputs: toolOutputs
                });
                // Continue polling after submitting tool outputs
                continue;
            }

            if (status === "completed") {
                const messages = await openai.beta.threads.messages.list(threadId);
                lastMessage = messages.data[0].content[0].text.value;
                completed = true;
            }
        }

        console.log("Reply length:", lastMessage?.length);

        // 4. Cart action check
        let cartAction = null;
        const actionMatch = lastMessage?.match(/\[ACTION:\s*ADD_TO_CART\((.*?)\)\]/);
        if (actionMatch) {
            const productId = actionMatch[1].trim();
            const userMsg = message.toLowerCase();
            const addKeywords = ['thêm', 'lấy', 'chốt', 'mua', 'add to cart', 'thêm vào giỏ', 'mua ngay', 'được', 'ok', 'vâng'];
            if (addKeywords.some(k => userMsg.includes(k))) {
                cartAction = { type: "ADD_TO_CART", productId };
            }
        }

        console.log("Sending products:", foundProducts.length);
        res.status(200).json({
            reply: lastMessage,
            threadId,
            cartAction,
            products: foundProducts
        });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({
            error: "An error occurred with the AI assistant.",
            details: error.message
        });
    }
};