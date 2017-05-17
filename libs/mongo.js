/**
 * Created by admin on 5/16/2017.
 */
var mongoose    = require('mongoose');
var config      = require('../config')

mongoose.connect(config.mongo.url);
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message)
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

var messageSchema = mongoose.Schema({
    received: Date,
    chatId: String,
    userId: String,
    username: String,
    totalWords: { type: Number, default: 0},
    text: String
});

var stickerSchema = mongoose.Schema({
    received: Date,
    chatId: String,
    userId: String,
    username: String
})

var Message = mongoose.model('Message', messageSchema);
var Sticker = mongoose.model('Sticker', stickerSchema);


module.exports.Message = Message;
module.exports.Sticker = Sticker;