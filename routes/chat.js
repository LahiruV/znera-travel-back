const router = require("express").Router();
const auth = require("../middleware/auth");
const Chat = require("../models/chat");

router.post("/chat", auth, async (req, res) => {
    const { user1, user2, uniqueChatId1, uniqueChatId2, messages } = req.body;
    try {
        const newChat = new Chat({
            user1, user2, uniqueChatId1, uniqueChatId2, messages
        });
        await newChat.save();
        res.json({ message: "Messasge send successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get("/getchats", auth, async (req, res) => {
    try {
        const chats = await Chat.find({}).populate("user1 user2");

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
