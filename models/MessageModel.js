/**
 * Created by admin on 9/11/2017.
 */
var mongoose = require("mongoose");
var messageSchema = mongoose.Schema({
    received: Date,
    chatId: Number,
    userId: Number,
    username: String,
    totalWords: { type: Number, default: 0},
    text: String,
    chat: String
});

var MessageModel = mongoose.model('Message', messageSchema);

module.exports = {
    MessageModel : MessageModel
}