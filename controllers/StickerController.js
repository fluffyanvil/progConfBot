/**
 * Created by admin on 9/11/2017.
 */
var StickerModel = require('../models/StickerModel').StickerModel;

module.exports = function () {
    module = {};
    var chatController = require('./ChatController')();
    module.TopStickersByChatId = function (chatId, callback) {
        StickerModel.aggregate([
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
                chatController.FindOne(chatId, callback);
            }
        });
    };
    module.TotalByChatId = function(chatId){
        StickerModel.count({chatId : chatId}).exec(function(err, stickersCount){
            if (err){
                console.log(err);
                return 0;
            }
            else {
                return stickersCount;
            }
        });
    };
    module.TotalTodayByChatId = function(chatId){
        var date = moment.utc().startOf('day');
        var yesterday = moment.utc().add(-1, 'days').startOf('day');
        StickerModel
            .count({})
            .where('received').gt(date)
            .where('chatId').equals(chatId)
            .exec(function (err, todayStickersCount){
                if (err) {
                    console.log(err);
                }
                else {
                    StickerModel
                        .count({})
                        .where('received').gt(yesterday)
                        .where('received').lt(date)
                        .where('chatId').equals(chatId)
                        .exec(function (err, yesterdayStickersCount){
                            if (err) {
                                console.log(err);
                            }
                            else {
                                return {
                                    todayStickersTotal: todayStickersCount,
                                    yesterdayStickersTotal: yesterdayStickersCount,
                                    stickerPercentage: Math.round((todayStickersCount / yesterdayStickersCount) * 100),
                                    stickersDirection: yesterdayStickersCount > todayStickersCount ? '\u2193' : (yesterdayStickersCount < todayStickersCount ? '\u2191' : 0)
                                };
                            }
                        });
                }
            });
    };
    module.OnNewMessage = function (msg) {
        var date = moment.unix(msg.date);
        StickerModel.create({
                received: date,
                chatId: msg.chat.id,
                userId: msg.from.id,
                username: msg.from.username
            },
            function (err, item){
                if (err) console.log(err);
            });
    }
    return module;
}