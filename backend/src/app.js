const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const decryptKeyRoutes = require('./routes/decryptKeyRoutes');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/', authRoutes);
app.use('/', uploadRoutes);

app.use('/', decryptKeyRoutes);


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

module.exports = app; 