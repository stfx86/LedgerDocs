const express = require("express");
const router = express.Router();
const { chatWithGemini } = require("../controllers/chatController");
const authenticateJWT = require('../utils/authenticateJWT');

router.post("/chat", authenticateJWT, chatWithGemini);

module.exports = router;
