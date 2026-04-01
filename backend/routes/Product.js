const express = require("express");
const productController = require("../controllers/Product");
const multer = require("multer");

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
