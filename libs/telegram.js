/**
 * Created by admin on 5/16/2017.
 */
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM
});

var telegram = function(){
    bot.start();
    var joinedUserController = require('../controllers/JoinedUserController')();
    var userController = require('../controllers/UserController')();
    var messageController = require('../controllers/MessageController')();
    var stickerController = require('../controllers/StickerController')();
    var chatController = require('../controllers/ChatController')();



    bot.on('text', function(msg) {
        messageController.OnNewMessage(msg);
        userController.OnNewMessage(msg);
        chatController.OnNewMessage(msg);
    });

    bot.on('sticker', function(msg){
        stickerController.OnNewMessage(msg);
    });

    bot.on('newChatMembers', function(msg){
        var botId = bot.getMe().id;
        console.log(msg);
        var user = msg.new_chat_member;
        if (user.id == botId)
            return;
        var message = '*У нас новый участник!*\n';
        message = message.concat(`*Ohayō gozaimasu, ${ user.first_name == null ? '' : user.first_name }${ user.last_name == null ? '' : ' ' + user.last_name }!*\n`);
        message = message.concat('*Каковы твои возраст, стек технологий, зп,* _ориентация_*?*\n');
        message = message.concat('*Кем видишь себя через 5 лет сидения в этом чате?*');
        joinedUserController.OnUserJoined(msg);
        return bot.sendMessage(msg.chat.id, message, {parseMode:'Markdown', replyToMessage:msg.message_id});
    });

    bot.on(/(^\/chart)/, function(msg){
        msg.reply.text(`http://progconfbotvue.herokuapp.com/chats/${msg.chat.id}`)
    });




};

module.exports.Telegram = telegram;