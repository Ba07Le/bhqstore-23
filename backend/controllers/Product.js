const Product = require("../models/Product");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const { randomUUID } = require("crypto");
const InventoryTransaction = require("../models/InventoryTransaction");

// Khởi tạo OpenAI (Đảm bảo đã có OPENAI_API_KEY trong file .env)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const toObjectIdList = (value) => {
  if (!value) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(",");

  return rawValues
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};

const buildProductFilter = (query = {}) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const brandIds = toObjectIdList(query.brand);
  if (brandIds.length) {
    filter.brand = { $in: brandIds };
  }

  const categoryIds = toObjectIdList(query.category);
  if (categoryIds.length) {
    filter.category = { $in: categoryIds };
  }

  if (query.tags) {
    const tags = Array.isArray(query.tags)
      ? query.tags
      : String(query.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    if (tags.length) {
      filter.tags = { $in: tags };
    }
  }

  if (query.user) {
    filter.isDeleted = false;
  }

  if (query.isDeleted === "true" || query.isDeleted === "false") {
    filter.isDeleted = query.isDeleted === "true";
  }

  if (query.stockStatus === "out") {
    filter.stockQuantity = { $lte: 0 };
  } else if (query.stockStatus === "low") {
    filter.stockQuantity = { $gt: 0, $lte: 20 };
  } else if (query.stockStatus === "in") {
    filter.stockQuantity = { $gt: 20 };
  }

  return filter;
};

const buildProductSort = (query = {}, fallback = { createdAt: -1 }) => {
  if (query.sort) {
    return {
      [query.sort]: query.order === "asc" ? 1 : -1,
    };
  }

  return fallback;
};

const parseNonNegativeInteger = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return Number.NaN;
  }

  return parsed;
};

const formatInventoryProduct = (product) => ({
  _id: product._id,
  title: product.title,
  brand: product.brand?.name || "",
  category: product.category?.name || "",
  price: product.price,
  stockQuantity: product.stockQuantity,
  isDeleted: product.isDeleted,
  thumbnail: product.thumbnail,
  updatedAt: product.updatedAt,
});

exports.create = async (req, res) => {
  try {
    const data = { ...req.body };

    data.price = Number(data.price);
    data.stockQuantity = Number(data.stockQuantity);
    data.description = data.description || "";

    // ✅ Parse tags if it's a string (from FormData)
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (!data.tags) {
      data.tags = [];
    }

  

// ✅ Parse specifications (FIX CHUẨN)
if (req.body.specifications) {
  try {
    data.specifications =
      typeof req.body.specifications === "string"
        ? JSON.parse(req.body.specifications)
        : req.body.specifications;

    // ✅ lọc dữ liệu rỗng
    data.specifications = data.specifications.filter(
      (s) => s.key && s.value
    );
  } catch (err) {
    return res.status(400).json({ message: "Specifications không hợp lệ" });
  }
} else {
  data.specifications = [];
}

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

    // ✅ Parse tags if it's a string (from FormData)
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (!updateData.tags) {
      updateData.tags = [];
    }

// ✅ Parse specifications khi update (FIX QUAN TRỌNG)
if ("specifications" in req.body) {
  try {
    updateData.specifications =
      typeof req.body.specifications === "string"
        ? JSON.parse(req.body.specifications)
        : req.body.specifications;

    // ✅ lọc dữ liệu rỗng
    updateData.specifications = updateData.specifications.filter(
      (s) => s.key && s.value
    );
  } catch (err) {
    return res.status(400).json({ message: "Specifications không hợp lệ" });
  }
}

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

exports.getInventorySnapshot = async (req, res) => {
  try {
    const filter = buildProductFilter(req.query);
    const sort = buildProductSort(req.query, { title: 1 });

    const products = await Product.find(filter)
      .sort(sort)
      .select("title brand category price stockQuantity isDeleted thumbnail updatedAt")
      .populate("brand")
      .populate("category");

    res.status(200).json(products.map(formatInventoryProduct));
  } catch (error) {
    console.error("getInventorySnapshot error:", error);
    res.status(500).json({ message: "Khong the xuat du lieu ton kho." });
  }
};

exports.bulkUpdateInventory = async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const sourceFileName = String(req.body?.sourceFileName || "").trim();

    if (!rows.length) {
      return res.status(400).json({ message: "Khong co dong nao de cap nhat ton kho." });
    }

    const validationErrors = [];
    const preparedRows = [];
    const seenProductIds = new Set();
    const duplicateProductIds = new Set();

    rows.forEach((row, index) => {
      const rowNumber = Number(row?.rowNumber) || index + 2;
      const productId = String(row?.productId || "").trim();
      const importQuantity = parseNonNegativeInteger(row?.importQuantity);
      const exportQuantity = parseNonNegativeInteger(row?.exportQuantity);
      const setStockQuantity = parseNonNegativeInteger(row?.setStockQuantity);
      const note = String(row?.note || "").trim();

      if (!productId) {
        validationErrors.push({ rowNumber, message: "Thieu productId." });
        return;
      }

      if (!mongoose.isValidObjectId(productId)) {
        validationErrors.push({ rowNumber, message: `productId khong hop le: ${productId}.` });
        return;
      }

      if (seenProductIds.has(productId)) {
        duplicateProductIds.add(productId);
      } else {
        seenProductIds.add(productId);
      }

      if (Number.isNaN(importQuantity)) {
        validationErrors.push({ rowNumber, message: "importQuantity phai la so nguyen >= 0." });
        return;
      }

      if (Number.isNaN(exportQuantity)) {
        validationErrors.push({ rowNumber, message: "exportQuantity phai la so nguyen >= 0." });
        return;
      }

      if (Number.isNaN(setStockQuantity)) {
        validationErrors.push({ rowNumber, message: "setStockQuantity phai la so nguyen >= 0." });
        return;
      }

      const normalizedImportQuantity = importQuantity ?? 0;
      const normalizedExportQuantity = exportQuantity ?? 0;

      if (
        setStockQuantity !== null &&
        (normalizedImportQuantity > 0 || normalizedExportQuantity > 0)
      ) {
        validationErrors.push({
          rowNumber,
          message: "Chi duoc dung setStockQuantity hoac import/export trong cung mot dong.",
        });
        return;
      }

      if (
        setStockQuantity === null &&
        normalizedImportQuantity === 0 &&
        normalizedExportQuantity === 0
      ) {
        validationErrors.push({
          rowNumber,
          message: "Dong nay khong co thay doi ton kho.",
        });
        return;
      }

      preparedRows.push({
        rowNumber,
        productId,
        importQuantity: normalizedImportQuantity,
        exportQuantity: normalizedExportQuantity,
        setStockQuantity,
        note,
      });
    });

    duplicateProductIds.forEach((productId) => {
      validationErrors.push({
        rowNumber: null,
        message: `File Excel dang co nhieu dong trung productId ${productId}.`,
      });
    });

    if (validationErrors.length) {
      return res.status(400).json({
        message: "File Excel co du lieu chua hop le.",
        errors: validationErrors,
      });
    }

    const productIds = [...seenProductIds];
    const products = await Product.find({ _id: { $in: productIds } }).select("title stockQuantity");
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const missingProducts = productIds
      .filter((productId) => !productMap.has(productId))
      .map((productId) => ({
        rowNumber: null,
        message: `Khong tim thay san pham voi productId ${productId}.`,
      }));

    if (missingProducts.length) {
      return res.status(400).json({
        message: "Danh sach ton kho co san pham khong ton tai.",
        errors: missingProducts,
      });
    }

    const stockErrors = [];
    const bulkOperations = [];
    const transactionDocs = [];
    const updatedProductIds = [];
    const batchId = randomUUID();
    const updatedAt = new Date();
    const summary = {
      processedRows: preparedRows.length,
      updatedRows: 0,
      skippedRows: 0,
      importedUnits: 0,
      exportedUnits: 0,
      adjustmentRows: 0,
    };
    const skippedRows = [];

    preparedRows.forEach((row) => {
      const product = productMap.get(row.productId);
      const previousStock = Number(product.stockQuantity || 0);

      let nextStock = previousStock;
      let quantityChange = 0;
      let changeType = "adjustment";

      if (row.setStockQuantity !== null) {
        nextStock = row.setStockQuantity;
        quantityChange = nextStock - previousStock;
        summary.adjustmentRows += 1;
      } else {
        nextStock = previousStock + row.importQuantity - row.exportQuantity;
        quantityChange = row.importQuantity - row.exportQuantity;
        summary.importedUnits += row.importQuantity;
        summary.exportedUnits += row.exportQuantity;

        if (quantityChange > 0) {
          changeType = "import";
        } else if (quantityChange < 0) {
          changeType = "export";
        }
      }

      if (nextStock < 0) {
        stockErrors.push({
          rowNumber: row.rowNumber,
          message: `Ton kho cua "${product.title}" se am sau khi cap nhat.`,
        });
        return;
      }

      if (quantityChange === 0) {
        skippedRows.push({
          rowNumber: row.rowNumber,
          productId: row.productId,
          message: "Khong co thay doi ton kho thuc te.",
        });
        summary.skippedRows += 1;
        return;
      }

      if (row.setStockQuantity !== null) {
        if (quantityChange > 0) {
          changeType = "import";
        } else if (quantityChange < 0) {
          changeType = "export";
        }
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              stockQuantity: nextStock,
              updatedAt,
            },
          },
        },
      });

      updatedProductIds.push(product._id);
      summary.updatedRows += 1;

      transactionDocs.push({
        product: product._id,
        productTitle: product.title,
        changeType,
        quantityChange,
        previousStock,
        nextStock,
        importQuantity: row.importQuantity,
        exportQuantity: row.exportQuantity,
        setStockQuantity: row.setStockQuantity,
        note: row.note,
        source: "excel",
        sourceFileName,
        batchId,
        actor: {
          userId: req.user?._id,
          email: req.user?.email || "",
        },
      });
    });

    if (stockErrors.length) {
      return res.status(400).json({
        message: "Co dong cap nhat lam ton kho am. He thong da huy toan bo dot nhap.",
        errors: stockErrors,
      });
    }

    if (!bulkOperations.length) {
      return res.status(200).json({
        message: "Khong co thay doi ton kho nao duoc ap dung.",
        summary,
        skippedRows,
      });
    }

    await Product.bulkWrite(bulkOperations);

    if (transactionDocs.length) {
      await InventoryTransaction.insertMany(transactionDocs);
    }

    const updatedProducts = await Product.find({ _id: { $in: updatedProductIds } })
      .populate("brand")
      .populate("category");

    res.status(200).json({
      message: "Cap nhat ton kho thanh cong.",
      batchId,
      summary,
      skippedRows,
      updatedProducts,
    });
  } catch (error) {
    console.error("bulkUpdateInventory error:", error);
    res.status(500).json({ message: "Khong the cap nhat ton kho tu file Excel." });
  }
};

exports.getInventoryHistory = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 8), 1), 50);
    const history = await InventoryTransaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json(history);
  } catch (error) {
    console.error("getInventoryHistory error:", error);
    res.status(500).json({ message: "Khong the tai lich su ton kho." });
  }
};

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

    // ✅ FILTER BY TAGS
    if (req.query.tags) {
      let tags = [];

      if (Array.isArray(req.query.tags)) {
        tags = req.query.tags;
      } else if (typeof req.query.tags === "string") {
        tags = req.query.tags.split(",").map(tag => tag.trim());
      }

      if (tags.length > 0) {
        filter.tags = { $in: tags };
      }
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
