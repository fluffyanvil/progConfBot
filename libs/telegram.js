/**
 * Created by admin on 5/16/2017.
 */
var config = require('../config');
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM
});
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
        var user = msg.new_chat_member;
        var id = msg.from.id;
        var replyToMessage = msg.message_id;
        var parseMode = 'html';
        return bot.sendMessage(
            id, `Эй, <b>${ user.first_name }</b> Язык программирования, зп, ориентация?`, {replyToMessage, parseMode}
        );
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