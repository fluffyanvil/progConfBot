/**
 * Created by admin on 5/16/2017.
 */
var mongoose    = require('mongoose');
var config      = require('../config')
var moment      = require('moment');

mongoose.connect(process.env.MONGO);
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
});

var joinedUserSchema = mongoose.Schema({
    id: Number,
    username: String,
    firstName: String,
    lastName: String,
    joinDate: Date,
    chatId: Number
})

var Message = mongoose.model('Message', messageSchema);
var Sticker = mongoose.model('Sticker', stickerSchema);
var User = mongoose.model('User', userSchema);
var Chat = mongoose.model('Chat', chatSchema);
var JoinedUser = mongoose.model('JoinedUser', joinedUserSchema);

module.exports = {
    Message: Message,
    User: User,
    Sticker: Sticker,
    Chat: Chat,
    JoinedUser: JoinedUser,
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
    StatMessagesByChatId: function (chatId, callback){
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
    StatStickersByChatId: function (chatId, callback){
        Sticker.aggregate([
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
    TopMessagesByChatId: function (chatId, callback) {
        Message.aggregate([
            {
                $lookup:
                    {
                        from: "users",
                        localField: "userId",
                        foreignField: "id",
                        as: "user"
                    }
            },
            {
                $unwind: '$user'
            },
            {
                $match : {
                    chatId : chatId
                }
            },
            {
                $group: {
                    _id: 1,
                    _id: '$user.id',
                    count: {$sum: 1},
                    firstName : { $first: '$user.firstName' },
                    lastName : { $first: '$user.lastName' }
                }
            },
            {
                $sort: {
                    "count": -1
                }
            },
            {
                $project: {
                    username : 1,
                    count: 1,
                    firstName: 1,
                    lastName: 1,
                }
            }
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
    TopStickersByChatId: function (chatId, callback) {
        Sticker.aggregate([
            {
                $lookup:
                    {
                        from: "users",
                        localField: "userId",
                        foreignField: "id",
                        as: "user"
                    }
            },
            {
                $unwind: '$user'
            },
            {
                $match : {
                    chatId : chatId
                }
            },
            {
                $group: {
                    _id: 1,
                    _id: '$user.id',
                    count: {$sum: 1},
                    firstName : { $first: '$user.firstName' },
                    lastName : { $first: '$user.lastName' }
                }
            },
            {
                $sort: {
                    "count": -1
                }
            },
            {
                $project: {
                    username : 1,
                    count: 1,
                    firstName: 1,
                    lastName: 1,
                }
            }
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
    TotalByChatId: function (chatId, callback){
        Message.count({chatId : chatId}).exec(function(err, messagesCount){
            if (err){
                callback(null, err);
            }
            else {
                Sticker.count({chatId : chatId}).exec(function(err, stickersCount){
                    if (err){
                        callback(null, err);
                    }
                    else {
                        callback({
                            messagesTotal: messagesCount,
                            stickersTotal: stickersCount
                        }, null)
                    }
                });
            }
        });
    },
    TotalTodayByChatId: function (chatId, callback){
        var date = moment.utc().startOf('day');
        var yesterday = moment.utc().add(-1, 'days').startOf('day');
        Message
            .count({})
            .where('received').gt(date)
            .where('chatId').equals(chatId)
            .exec(function (err, todayMessagesCount){
                if (err) {
                    callback(null, err)
                }
                else {
                    Message
                        .count({})
                        .where('received').gt(yesterday)
                        .where('received').lt(date)
                        .where('chatId').equals(chatId)
                        .exec(function (err, yesterdayMessagesCount){
                            if (err) {
                                callback(null, err)
                            }
                            else {
                                Sticker
                                    .count({})
                                    .where('received').gt(date)
                                    .where('chatId').equals(chatId)
                                    .exec(function (err, todayStickersCount){
                                        if (err) {
                                            callback(null, err)
                                        }
                                        else {
                                            Sticker
                                                .count({})
                                                .where('received').gt(yesterday)
                                                .where('received').lt(date)
                                                .where('chatId').equals(chatId)
                                                .exec(function (err, yesterdayStickersCount){
                                                    if (err) {
                                                        callback(null, err)
                                                    }
                                                    else {
                                                        callback({
                                                            todayMessagesTotal: todayMessagesCount,
                                                            todayStickersTotal: todayStickersCount,
                                                            yesterdayStickersTotal: yesterdayStickersCount,
                                                            yesterdayMessagesTotal: yesterdayMessagesCount,
                                                            messagePercentage: Math.round((todayMessagesCount / yesterdayMessagesCount) * 100),
                                                            stickerPercentage: Math.round((todayStickersCount / yesterdayStickersCount) * 100),
                                                            messagesDirection: yesterdayMessagesCount > todayMessagesCount ? '\u2193' : (yesterdayMessagesCount < todayMessagesCount ? '\u2191' : 0),
                                                            stickersDirection: yesterdayStickersCount > todayStickersCount ? '\u2193' : (yesterdayStickersCount < todayStickersCount ? '\u2191' : 0)
                                                        }, null)
                                                    }
                                                });
                                        }
                                    });
                            }
                        });
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
                //text: msg.text,
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
    },
    OnUserJoined: function(msg){
        var joinedUser = msg.new_chat_member;
        JoinedUser.create({
            id: joinedUser.id,
            username: joinedUser.username,
            firstName: joinedUser.first_name,
            lastName: joinedUser.last_name,
            joinDate: moment.unix(msg.date),
            chatId: msg.chat.id
        });
    },
    JoinedToday: function(chatId, callback){
        var date = moment.utc().startOf('day');
        JoinedUser
            .find({
                joinDate: {$gt : date},
                chatId: chatId
            })
            .exec(function(error, users){
                if (error) {
                    callback(null, err)
                }
                else {
                    callback(users, null);
                }
            });
    }
};


