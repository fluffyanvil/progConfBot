/**
 * Created by admin on 9/11/2017.
 */
const MessageModel = require('../models/MessageModel').MessageModel;
const moment = require('moment');


module.exports = function () {
    module = {};
    const ChatController = require('./ChatController')();
    module.StatByChatName = function (chat, callback){
        MessageModel.aggregate([
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
    };
    module.StatMessagesByChatId = function (chatId, callback) {
        MessageModel.aggregate([
            {
                $match: {
                    chatId: chatId
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
                    day: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
                }
            }
        ], function (err, result) {
            if (err) {

            } else {
                ChatController.FindOne(chatId, callback);
            }
        })
    };
    module.TopByChatName = function (chat, callback) {
        MessageModel.aggregate([
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
    };
    module.TopMessagesByChatId = function (chatId, callback) {
        MessageModel.aggregate([
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
                ChatController.FindOne(chatId, callback);
            }
        });
    };
    module.OnNewMessage = function(msg){
        const date = moment.unix(msg.date);
        MessageModel.create({
                received: date,
                chatId: msg.chat.id,
                userId: msg.from.id,
                username: msg.from.username,
                chat: msg.chat.username
            },
            function (err, item){
                if (err) console.log(err);
            });
    };
    module.TotalByChatId = function (chatId){
        MessageModel.count({chatId : chatId}).exec(function(err, messagesCount){
            if (err){
                console.log(err);
                return 0;
            }
            else {
                return messagesCount;
            }
        });
    };
    module.TotalTodayByChatId = function(chatId){
        const date = moment.utc().startOf('day');
        const yesterday = moment.utc().add(-1, 'days').startOf('day');
        MessageModel
            .count({})
            .where('received').gt(date)
            .where('chatId').equals(chatId)
            .exec(function (err, todayMessagesCount){
                if (err) {
                    console.log(err);
                }
                else {
                    MessageModel
                        .count({})
                        .where('received').gt(yesterday)
                        .where('received').lt(date)
                        .where('chatId').equals(chatId)
                        .exec(function (err, yesterdayMessagesCount){
                            if (err) {
                                console.log(err);
                            }
                            else {
                                return {
                                    todayMessagesCount: todayMessagesCount,
                                    yesterdayMessagesCount: yesterdayMessagesCount,
                                    messagePercentage: Math.round((todayMessagesCount / yesterdayMessagesCount) * 100),
                                    stickersDirection: yesterdayMessagesCount > todayMessagesCount ? '\u2193' : (yesterdayMessagesCount < todayMessagesCount ? '\u2191' : 0)
                                };
                            }
                        });
                }
            });
    };
    return module;
};
