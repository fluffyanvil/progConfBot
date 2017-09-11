/**
 * Created by admin on 9/11/2017.
 */
var mongoose = require("mongoose");
var stickerSchema = mongoose.Schema({
    received: Date,
    chatId: Number,
    userId: Number,
    username: String
});

var StickerModel = mongoose.model('Sticker', stickerSchema);

module.exports = {
    StickerModel : StickerModel
}