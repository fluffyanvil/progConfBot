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
        mongo.OnNewMessage(msg);
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
                    reply.push(`@${item.username} : ${item.count} messages`);
                });
                var ans = reply.join("\r\n");
                console.log(ans);
                msg.reply.text(ans);
            }
        });
    });

    bot.on(/(^\/plot$)/, function(msg){
        mongo.Message.aggregate([
            { $match : { chatId : msg.chat.id.toString() } },
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
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: 1,
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                const D3Node = require('d3-node')
                const d3n = new D3Node()      // initializes D3 with container element
                d3n.createSVG(10,20).append('g') // create SVG w/ 'g' tag and width/height
                d3n.svgString();
                msg.reply.text(JSON.stringify(d3n.svgString()));
                var data = [{
                    x: result.map(function (item) {
                        return item.day;
                    }), y: result.map(function (item) {
                        return item.count;
                    })
                }];
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