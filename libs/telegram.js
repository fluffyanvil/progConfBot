/**
 * Created by admin on 5/16/2017.
 */
var config = require('../config');
const TeleBot = require('telebot');
const bot = new TeleBot(process.env.TELEGRAM);
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

    bot.on('newChatMembers', function(msg){
        console.log(msg);
        var message = "```язык программирования, зп, ориентация? *кидает полотенце под ноги*```";
        msg.reply.text(message)
    });

    bot.on(/(^\/chart$)/, function(msg){
        msg.reply.text(`${config.herokuUrl}${config.apiStat}${msg.chat.id}`)
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