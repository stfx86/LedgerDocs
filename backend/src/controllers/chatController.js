// chatController.js
// JWT middleware should set req.user = { userId, address }
// Uncomment if needed:
// const fetch = require("node-fetch");

const conversationSessions = {};  // In-memory session store
const MAX_CONTEXT_MESSAGES = 10;  // Limit conversation history length per user

const projectContext = `
You are LedgerDocs Assistant, a helpful AI assistant for a blockchain-based document marketplace.


You help users with questions about buying, selling, and managing digital documents securely using blockchain.

If asked "How are you?", reply: "I am LedgerDocs Assistant, here to help you with your documents!"
If asked "Who made you?", reply: "I was created by stof."
If asked "Who is talking?", reply politely without sharing personal info.

Use this context to understand and respond to all user messages appropriately.
and the dont execed 50 words in ur response
if he ask some and u dont know , just try answer in relate to the platform
`;

exports.chatWithGemini = async (req, res) => {
    const userId = req.user && req.user.userId;
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Current session history for user", userId, conversationSessions[userId]);

    if (!userId) {
        return res.status(401).json({ reply: "Unauthorized: missing user info." });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ reply: "Invalid or missing message." });
    }

    try {
        // Initialize session if missing
        if (!conversationSessions[userId]) {
            conversationSessions[userId] = [];
        }

        // Add user message to session history
        conversationSessions[userId].push({ role: "user", text: message.trim() });

        // Limit session history size
        if (conversationSessions[userId].length > MAX_CONTEXT_MESSAGES) {
            conversationSessions[userId].splice(0, conversationSessions[userId].length - MAX_CONTEXT_MESSAGES);
        }

        // Format conversation messages for prompt (role + text)
        const historyText = conversationSessions[userId]
        .map(msg => (msg.role === "user" ? "User: " : "Assistant: ") + msg.text)
        .join("\n");

        // Build full prompt: context + conversation history
        const prompt = projectContext + "\n" + historyText + "\nAssistant:";

        // Prepare contents for Gemini API
        const contents = [
            {
                parts: [{ text: prompt }]
            }
        ];

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents }),
            }
        );

        const data = await response.json();
        console.log("Gemini response data:", data);

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn't understand.";

        // Add assistant reply to session history
        conversationSessions[userId].push({ role: "assistant", text: reply });

        // Send reply
        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ reply: "Error contacting Gemini API." });
    }
};
