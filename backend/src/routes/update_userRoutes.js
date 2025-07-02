const express = require('express');
const router = express.Router();
const update_userController = require('../controllers/update_userController');
const authenticateJWT = require('../utils/authenticateJWT');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

// Create a rate limiter: max 1 request per 10 seconds per IP
const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1,              // limit each IP to 1 request per windowMs
    message: "Too many requests, please try again later.",
});


// Temporary storage config (use disk storage)
const upload = multer({ dest: 'uploads/' });

// Define route with multer and JWT middleware
router.post(
    '/update-user',
    limiter,
    authenticateJWT,
    upload.single('image'),
            update_userController.update_user
);

module.exports = router;
