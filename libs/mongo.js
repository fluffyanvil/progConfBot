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
    text: String,
    chat: String
});

var stickerSchema = mongoose.Schema({
    received: Date,
    chatId: String,
    userId: String,
    username: String
});

var userSchema = mongoose.Schema({
    id: Number,
    username: String,
    firstName: String,
    lastName: String
})

var Message = mongoose.model('Message', messageSchema);
var Sticker = mongoose.model('Sticker', stickerSchema);
var User = mongoose.model('User', userSchema);


module.exports = {
    Message: Message,
    User: User,
    Sticker: Sticker,
    Stat: function (chat, callback){
        Message.aggregate([
            { $match : { chat : chat } },
            {
                $group: {
                    _id: {$dayOfYear: '$received'},
                    count: {$sum: 1},
                    date: {$first: '$received'}
                }
            },
            {
                $sort: {
                    date: 1
                }
            },
            {
                $project: {
                    count: 1,
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                }
            }
        ], function (err, result) {
            if (err) {

            } else {
                callback(result, null);
                //var data = [{x: result.map(function(item){return item.day;}), y: result.map(function(item){return item.count;})}];
            }
        })
    }
};


