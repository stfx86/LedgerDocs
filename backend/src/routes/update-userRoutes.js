const express = require('express');
const router = express.Router();
const update_userController = require('../controllers/update_userController');
const authenticateJWT = require('../utils/authenticateJWT');
const multer = require('multer');

// Temporary storage config (use memory storage for IPFS compatibility)
const upload = multer({ storage: multer.memoryStorage() });

// Define route with multer and JWT middleware
router.post(
    '/update_user',
    authenticateJWT,
    upload.single('image'),
            update_userController.update_user
);

module.exports = router;
