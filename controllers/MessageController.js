/**
 * Created by admin on 9/11/2017.
 */
const MessageModel = require('../models/MessageModel').MessageModel;
const moment = require('moment');


module.exports = function () {
    module = {};

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

    module.Count = function (chatId, startDate, endDate){
        const conditions = {};
        conditions.$and = [{
            chatId : chatId
        }];
        if (endDate)
            conditions.$and.push({received : { $lt : endDate}});
        if (startDate)
            conditions.$and.push({received : { $gt : startDate}});

        return new Promise((resolve, reject) => {
            MessageModel
                .count(conditions)
                .exec(function (err, count){
                    if (err) reject(Error(err));
                    resolve(count);
                });
        })
    };

    module.Top = (chatId) => {
        return new Promise((resolve, reject) => {
            MessageModel.aggregate([
                {
                    $match : {
                        chatId : chatId,
                    }
                },
                {
                    $group: {
                        _id: 1,
                        _id: '$userId',
                        count: {$sum: 1},
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
            ], function (err, messages) {
                if (err) reject(Error(err));
                resolve(messages);
            });
        })
    };

    module.Stat = (chatId, startDate) => {
        return new Promise((resolve, reject) => {
            let condition = [];
            condition.push({
                $match : {
                    chatId : chatId
                }
            });

            condition.push({
                $group: {
                    _id: {$dayOfYear: '$received'},
                    count: {$sum: 1},
                    date: {$first: '$received'}
                }
            });

            condition.push({
                $sort: {
                    date: 1
                }
            });

            condition.push({
                $project: {
                    count: 1,
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                }
            });

            MessageModel
                .aggregate(condition, function (err, result) {
                    if (err) reject(Error(err));
                    resolve(result);
                })
        });
    };

    return module;
};
