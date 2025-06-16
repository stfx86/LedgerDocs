const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or malformed header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // replace with your secret
    console.log('Decoded token payload:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('JWT verification error:', err.message);
    res.status(403).json({ message: 'Invalid token' });
  }
};
