const router = require("express").Router();
const auth = require("../middleware/auth");
const { GoogleGenerativeAI } = require('@google/generative-ai');


const apiKey = 'AIzaSyCJRZ9X_xYlVo3nW8iQ-pAnlh-MRUgaZZY';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

router.post('/sendMessage', auth, async (req, res) => {
    const { message } = req.body;

    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: 'user',
                    parts: [{ text: message }],
                },
            ],
        });

        const result = await chatSession.sendMessage(message);
        const botResponse = result.response.text();

        res.json(botResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

