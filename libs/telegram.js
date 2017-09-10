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
        var date = moment.unix(msg.date);
        mongo.Sticker.create({
            received: date,
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
        var user = msg.new_chat_member;
        if (user.id == config.bot_id)
            return;
        var message = '*У нас новый участник!*\n';
        message = message.concat(`*Ohayō gozaimasu, ${ user.first_name == null ? '' : user.first_name }${ user.last_name == null ? '' : ' ' + user.last_name }!*\n`);
        message = message.concat('*Каковы твои возраст, стек технологий, зп,* _ориентация_*?*\n');
        message = message.concat('*Кем видишь себя через 5 лет сидения в этом чате?*');
        mongo.OnUserJoined(msg);
        return bot.sendMessage(msg.chat.id, message, {parseMode:'Markdown', replyToMessage:msg.message_id});
    });

    bot.on(/(^\/chart)/, function(msg){
        msg.reply.text(`http://progconfbotvue.herokuapp.com/chats/${msg.chat.id}`)
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