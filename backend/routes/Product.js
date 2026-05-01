const express = require("express");
const productController = require("../controllers/Product");
const multer = require("multer");
const { verifyToken } = require("../middleware/VerifyToken");
const { requireAdmin } = require("../middleware/VerifyAdmin");

const path = require("path");
const fs = require("fs");

const router = express.Router();


const uploadDir = path.join(__dirname, "..", "uploads", "products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});


const upload = multer({ storage });


router

  .get("/inventory/snapshot", verifyToken, requireAdmin, productController.getInventorySnapshot)
  .get("/inventory/history", verifyToken, requireAdmin, productController.getInventoryHistory)
  .post("/inventory/bulk-update", verifyToken, requireAdmin, productController.bulkUpdateInventory)

  .post(
    "/",
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ]),
    productController.create
  )

 
  .get("/", productController.getAll)
  .get("/:id", productController.getById)

 
  .patch(
    "/:id",
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ]),
    productController.updateById
  )


  .patch("/undelete/:id", productController.undeleteById)

 
  .delete("/:id", productController.deleteById);

module.exports = router;
