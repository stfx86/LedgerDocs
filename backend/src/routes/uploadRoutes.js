const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const multer = require('multer');

// Temporary storage config (uploads to memory or disk)
const upload = multer({ dest: 'uploads/' }); // you can customize this

// JWT middleware
const authenticate = require('../utils/authenticateJWT');

// Define route with multer and JWT middleware
router.post(
  '/upload',
  authenticate,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  uploadController.handleUpload
);

module.exports = router;
