const Product = require("../models/Product");
const mongoose = require("mongoose");
const OpenAI = require("openai");

// Khởi tạo OpenAI (Đảm bảo đã có OPENAI_API_KEY trong file .env)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.create = async (req, res) => {
  try {
    const data = { ...req.body };

    data.price = Number(data.price);
    data.stockQuantity = Number(data.stockQuantity);
    data.description = data.description || "";

    // --- LOGIC AI: TẠO VECTOR KHI THÊM MỚI ---
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `${data.title} ${data.description}`,
      });
      data.description_vector = response.data[0].embedding;
      console.log("✅ AI: Đã tạo vector thành công cho sản phẩm mới.");
    } catch (aiError) {
      console.error("❌ AI: Lỗi tạo Embedding:", aiError.message);
      // Không chặn luồng chính, sản phẩm vẫn được tạo dù AI lỗi
    }

    if (!req.files?.thumbnail?.[0]) {
      return res.status(400).json({ message: "Cần có thumbnail sản phẩm" });
    }
    data.thumbnail = `/uploads/products/${req.files.thumbnail[0].filename}`;

    if (!req.files?.images?.length) {
      return res.status(400).json({ message: "Cần có hình ảnh sản phẩm" });
    }

    data.images = req.files.images.map(
      (file) => `/uploads/products/${file.filename}`
    );

    const created = new Product(data);
    await created.save();

    res.status(201).json(created);
  } catch (error) {
    console.log("LỖI TẠO SẢN PHẨM:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm, vui lòng thử lại sau." });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    updateData.price = Number(updateData.price);
    updateData.stockQuantity = Number(updateData.stockQuantity);

    // --- LOGIC AI: CẬP NHẬT VECTOR NẾU THAY ĐỔI NỘI DUNG ---
    if (req.body.title || req.body.description) {
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: `${updateData.title || ""} ${updateData.description || ""}`,
        });
        updateData.description_vector = response.data[0].embedding;
        console.log("✅ AI: Đã cập nhật lại vector theo nội dung mới.");
      } catch (aiError) {
        console.error("❌ AI: Lỗi cập nhật Embedding:", aiError.message);
      }
    }

    if (req.files?.thumbnail?.length) {
      updateData.thumbnail = `/uploads/products/${req.files.thumbnail[0].filename}`;
    } else if (req.body.oldThumbnail) {
      updateData.thumbnail = req.body.oldThumbnail;
    }

    let images = [];
    if (req.body.oldImages) {
      images = Array.isArray(req.body.oldImages)
        ? req.body.oldImages
        : [req.body.oldImages];
    }

    if (req.files?.images?.length) {
      const newImages = req.files.images.map(
        (file) => `/uploads/products/${file.filename}`
      );
      images = [...images, ...newImages];
    }
    updateData.images = images;

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("brand")
      .populate("category");

    res.status(200).json(updated);
  } catch (error) {
    console.error("updateById error:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sản phẩm, vui lòng thử lại sau." });
  }
};

// --- CÁC HÀM GET VÀ DELETE GIỮ NGUYÊN ---

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    const sort = {};
    let skip = 0;
    let limit = 12;

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // --- FIX MULTIPLE BRAND ---
if (req.query.brand) {
  let brands = [];

  if (Array.isArray(req.query.brand)) {
    brands = req.query.brand;
  } else if (typeof req.query.brand === "string") {
    brands = req.query.brand.split(","); // 👈 FIX QUAN TRỌNG
  }

  filter.brand = {
    $in: brands.map((id) => new mongoose.Types.ObjectId(id.trim())),
  };
}

// --- FIX MULTIPLE CATEGORY ---
if (req.query.category) {
  let categories = [];

  if (Array.isArray(req.query.category)) {
    categories = req.query.category;
  } else if (typeof req.query.category === "string") {
    categories = req.query.category.split(","); // 👈 FIX QUAN TRỌNG
  }

  filter.category = {
    $in: categories.map((id) => new mongoose.Types.ObjectId(id.trim())),
  };
}

    if (req.query.user) filter.isDeleted = false;
    if (req.query.isDeleted === "true" || req.query.isDeleted === "false") {
      filter.isDeleted = req.query.isDeleted === "true";
    }

    if (req.query.stockStatus === "out") {
      filter.stockQuantity = { $lte: 0 };
    } else if (req.query.stockStatus === "low") {
      filter.stockQuantity = { $gt: 0, $lte: 20 };
    } else if (req.query.stockStatus === "in") {
      filter.stockQuantity = { $gt: 20 };
    }

    if (req.query.page && req.query.limit) {
      limit = parseInt(req.query.limit, 10);
      skip = limit * (parseInt(req.query.page, 10) - 1);
    }

    const totalDocs = await Product.countDocuments(filter);
    if (req.query.sort) {
      sort[req.query.sort] = req.query.order === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const results = await Product.find(filter)
      .sort(sort)
      .populate("brand")
      .populate("category")
      .skip(skip)
      .limit(limit)
      .exec();
    
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Không thể tải sản phẩm." });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Product.findById(id).populate("brand").populate("category");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi chi tiết sản phẩm." });
  }
};

exports.undeleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const unDeleted = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true })
      .populate("brand").populate("category");
    res.status(200).json(unDeleted);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khôi phục." });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .populate("brand").populate("category");
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa." });
  }
};