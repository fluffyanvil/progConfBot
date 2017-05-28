/**
 * Created by admin on 5/16/2017.
 */
var mongoose    = require('mongoose');
var config      = require('../config')
var moment      = require('moment');

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
    chatId: Number,
    userId: Number,
    username: String,
    totalWords: { type: Number, default: 0},
    text: String,
    chat: String
});

var chatSchema = mongoose.Schema({
    id: Number,
    title: String
});

var stickerSchema = mongoose.Schema({
    received: Date,
    chatId: Number,
    userId: Number,
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
var Chat = mongoose.model('Chat', chatSchema);


module.exports = {
    Message: Message,
    User: User,
    Sticker: Sticker,
    Chat: Chat,
    StatByChatName: function (chat, callback){
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
            }
        })
    },
    StatByChatId: function (chatId, callback){
        Message.aggregate([
            {
                $match : {
                    chatId : chatId
                }
            },
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
                Chat.findOne({id: chatId}, function(e, r){
                    if (e) {

                    }
                    else{
                        callback({data: result, chatname: r ? r.title : null}, null);
                    }

                })

                //var data = [{x: result.map(function(item){return item.day;}), y: result.map(function(item){return item.count;})}];
            }
        })
    },
    TopByChatName: function (chat, callback) {
        Message.aggregate([
            { $match : { chat : chat } },
            {
                $group: {
                    _id: '$userId',
                    count: {$sum: 1},
                    username : { $first: '$username' }
                }
            },
            {
                $sort: {
                    "count": -1
                }
            },
            {
                $limit: 3
            },
            {
                $project : {
                    username : 1,
                    count : 1
                }
            }
        ], function (err, result) {
            if (err) {
                callback(null, err)
            } else {
                callback(result, null)
            }
        });
    },

    TopByChatId: function (chatId, callback) {
        Message.aggregate([
            {
                $match : {
                    chatId : chatId
                }
            },
            {
                $group: {
                    _id: '$userId',
                    count: {$sum: 1},
                    username : { $first: '$username' }
                }
            },
            {
                $sort: {
                    "count": -1
                }
            },
            {
                $project : {
                    username : 1,
                    count : 1
                }
            },
        ], function (err, result) {
            if (err) {
                callback(null, err)
            } else {
                Chat.findOne({id: chatId}, function(e, r){
                    if (e) {

                    }
                    else{

                        callback({data: result, chatname: r ? r.title : null}, null);
                    }
                })
            }
        });
    },
    OnNewMessage: function (msg){
        Message.create({
                received: moment.utc(),
                chatId: msg.chat.id,
                userId: msg.from.id,
                username: msg.from.username,
                totalWords: msg.text.split(" ").length,
                text: msg.text,
                chat: msg.chat.username
            },
            function (err, item){
                if (err) console.log(err);
            });

        Chat.findOneAndUpdate({
            id: msg.chat.id
        }, {
            id: msg.chat.id,
            title: msg.chat.title
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });

        User.findOneAndUpdate({
            id : msg.from.id
        }, {
            id: msg.from.id,
            username: msg.from.username,
            firstName: msg.from.first_name,
            lastName: msg.from.last_name
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });
    }
};


