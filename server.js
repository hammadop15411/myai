const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Home test
app.get("/", (req, res) => {
    res.send("ENOVA AI backend is running!");
});

// Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        // Check message
        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        console.log("User:", message);
        console.log("ENOVA is thinking...");

        // Send to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: message
        });

        // Get AI response
        const reply = response.text;

        console.log("ENOVA:", reply);

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        // Quota error
        if (error.status === 429) {
            return res.status(429).json({
                error: "ENOVA's Gemini quota has been reached. Please try again after the quota resets."
            });
        }

        // Model unavailable
        if (error.status === 503) {
            return res.status(503).json({
                error: "Gemini is temporarily unavailable. Please try again later."
            });
        }

        // Other errors
        res.status(500).json({
            error: "ENOVA could not get a response right now."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("====================================");
    console.log("        ENOVA AI BACKEND");
    console.log("====================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Status: ONLINE");
    console.log("====================================");
    console.log("");
});