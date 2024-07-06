const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        user1: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user2: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        uniqueChatId1: {
            type: String,
            required: true,
        },
        uniqueChatId2: {
            type: String,
            required: true,
        },
        messages: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
