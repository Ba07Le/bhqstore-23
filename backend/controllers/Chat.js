const OpenAI = require("openai");

let openaiClient = null;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.startsWith("replace-with-")) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
};

const getFallbackReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("ship") || text.includes("giao")) {
    return "Shop hỗ trợ kiểm tra phí và thời gian giao hàng ngay trên trang thanh toán. Bạn cứ thêm sản phẩm vào giỏ để xem chi tiết.";
  }

  if (text.includes("đơn") || text.includes("order")) {
    return "Bạn có thể xem trạng thái đơn hàng trong mục lịch sử đơn hàng sau khi đăng nhập tài khoản.";
  }

  if (text.includes("giá") || text.includes("khuyến mãi")) {
    return "Bạn có thể xem giá và tình trạng tồn kho trực tiếp trên từng sản phẩm. Nếu cần, mình có thể gợi ý sản phẩm phù hợp nhu cầu.";
  }

  return "Mình đang ở chế độ hỗ trợ cơ bản. Bạn có thể hỏi về sản phẩm, tình trạng đơn hàng, giao hàng hoặc cách mua hàng trên website.";
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = getOpenAIClient();

    if (!client) {
      return res.status(200).json({
        reply: getFallbackReply(message),
        mode: "fallback",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Ban la tro ly ban hang cho website thuong mai dien tu BHQ Store.
Tra loi ngan gon, than thien, uu tien huong dan mua hang, giao hang, bao hanh va tinh trang san pham.

Khach hang: ${message}`,
    });

    const reply =
      response.output_text?.trim() || getFallbackReply(message);

    return res.status(200).json({
      reply,
      mode: "ai",
    });
  } catch (error) {
    console.error("Chat AI error:", error);

    return res.status(200).json({
      reply: getFallbackReply(req.body?.message || ""),
      mode: "fallback",
    });
  }
};
