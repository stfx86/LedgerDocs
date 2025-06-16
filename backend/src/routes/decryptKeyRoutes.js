const express = require('express');
const router = express.Router();
const decryptKeyController = require('../controllers/decryptKeyController');
const authenticateJWT = require('../utils/authenticateJWT');

router.post('/get-key', authenticateJWT, decryptKeyController.getDecryptionKey);

module.exports = router;
