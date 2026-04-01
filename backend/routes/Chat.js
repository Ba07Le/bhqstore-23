const express = require("express");
const { chatWithAI } = require("../controllers/Chat");

const router = express.Router();

router.post("/", chatWithAI);

module.exports = router; // ✅ QUAN TRỌNG