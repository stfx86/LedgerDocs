const jwt = require('jsonwebtoken');
const verifySignature = require('../utils/verifySignature');

exports.login = async (req, res) => {
    const { address, message, signature } = req.body;
    if (!address || !message || !signature) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const isValid = await verifySignature(address, message, signature);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
    }

    // Issue JWT
    const token = jwt.sign({ address }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}; 