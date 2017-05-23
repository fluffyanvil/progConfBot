/**
 * Created by admin on 5/16/2017.
 */
var config = require('../config');
const TeleBot = require('telebot');
const bot = new TeleBot(config.telegram.token);
var mongo = require('./mongo');
var moment = require('moment');

var telegram = function(){
    bot.on('text', function(msg) {
        console.log(msg);
        mongo.Message.create({
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

        mongo.User.findOneAndUpdate({
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
    });

    bot.on('sticker', function(msg){
        mongo.Sticker.create({
            received: moment.utc(),
            chatId: msg.chat.id,
            userId: msg.from.id,
            username: msg.from.username
        },
        function (err, item){
            if (err) console.log(err);
        });
    });

    bot.on(/^\/mss (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];

        var condition = {};
        if (username)
            condition.username = username[0] == '@' ? username.substring(1, username.length) : username;

        mongo.Message.where('chatId').equals(msg.chat.id).count(condition,
        function (err, count){
            if (err) {
                console.log(err);
                return;
            }
            msg.reply.text(count + " message(s) from " + username)
        });
    });

    bot.on(/(^\/mss$)/, function(msg){
        mongo.Message
            .where('chatId').equals(msg.chat.id)
            .count({},
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " total message(s)")
            });
    });

    bot.on(/(^\/msst$)/, function(msg){
        var offset = moment.unix(msg.date).utcOffset();
        var date = moment.utc().startOf('day');
        var newDate = moment(date).add(-1 * offset, 'm');
        mongo.Message
            .count({})
            .where('received').gt(newDate)
            .where('chatId').equals(msg.chat.id)
            .exec(function (err, doc){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(doc + " total message(s) today")
            });
    });

    bot.on(/(^\/sts$)/, function(msg){
        mongo.Sticker
            .where('chatId').equals(msg.chat.id)
            .count({},
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " total stickers(s)")
            });
    });

    bot.on(/^\/sts (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];
        mongo.Sticker.where('chatId').equals(msg.chat.id).count({
                username: username[0] == '@' ? username.substring(1, username.length) : username
            },
            function (err, count){
                if (err) {
                    console.log(err);
                    return;
                }
                msg.reply.text(count + " sticker(s) from " + username)
            });
    });

    bot.on(/^\/tw (.+)$/, function(msg){
        var username = msg.text.split(" ")[1];
        mongo.Message.where('chatId').equals(msg.chat.id).find({
                username: username[0] == '@' ? username.substring(1, username.length) : username
            },
            function (err, doc){
                if (err) {
                    console.log(err);
                    return;
                }
                if (doc.length > 0){
                    var sumValues = doc.map(totalWords).reduce(sum);
                    msg.reply.text(sumValues + " total words from " + username);
                }
            });
    });

    bot.on(/(^\/top3$)/, function(msg){
        mongo.Message.aggregate([
            { $match : { chatId : msg.chat.id.toString() } },
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
                console.log(err);
            } else {
                var reply = ["top 3 users:"];
                result.forEach(function(item, i, arr) {
                    reply.push(`${item.username} : ${item.count}`);
                });
                msg.reply.text(reply.join("\r\n"))
            }
        });
    });

    function totalWords(item){
        return item.totalWords;
    }

    function sum(prev, next){
        return prev + next;
    }

    bot.start();
}



module.exports.Telegram = telegram;