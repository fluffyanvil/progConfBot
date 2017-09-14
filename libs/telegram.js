/**
 * Created by admin on 5/16/2017.
 */
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM,
    usePlugins: ['askUser', 'commandButton'],
    pluginFolder: '../plugins/',
});

var telegram = function(){
    var lastMessage;
    bot.start();
    var joinedUserController = require('../controllers/JoinedUserController')();
    var userController = require('../controllers/UserController')();
    var messageController = require('../controllers/MessageController')();
    var stickerController = require('../controllers/StickerController')();
    var chatController = require('../controllers/ChatController')();
    var subscriptionController = require('../controllers/SubscriptionController')();

    bot.on('text', function(msg) {
        messageController.OnNewMessage(msg);
        userController.OnNewMessage(msg);
        chatController.OnNewMessage(msg);
    });

    bot.on(/\W*(\/subscribe\b)\W*/, function(msg){
        addSubscriptions(msg);
    });

    bot.on(/\W*(\/subscribes\b)\W*/, function (msg) {
        var chatType = msg.chat.type;
        if (chatType === 'private')
        {
            getSubscriptions(msg);
        }
    });

    // Inline button callback
    bot.on('callbackQuery', msg => {
        deleteSubscription(msg, msg.data);
    });

    var getSubscriptions = function(msg){
        subscriptionController.GetUserSubscriptions(msg.from.id)
            .then(subs => {
                if (subs === undefined || subs.length === 0)
                    msg.reply.text(`you have no subscriptions`);
                else {
                    var buttons = [];
                    subs.forEach(subscription => {
                        buttons.push([bot.inlineButton(`${subscription.tag} 🗑`, {callback: subscription._id})]);
                    });
                    let replyMarkup = bot.inlineKeyboard(buttons);
                    return bot.sendMessage(msg.from.id, 'Your subs', {replyMarkup});
                }
            })
            .then(re => {
                lastMessage = [msg.from.id, re.result.message_id];
            })
            .catch(error => {
                return bot.sendMessage(msg.from.id, 'error')
            });
    }

    var addSubscriptions = function (msg) {
        let chatType = msg.chat.type;
        let tags = msg.text.match(/#(\w*[0-9a-zA-Zа-яА-Я])/g);
        if (chatType === 'private')
        {
            if (tags === undefined || tags.length === 0)
                return bot.sendMessage(msg.from.id, 'use #hashtags');
            subscriptionController.AddSubscriptions(msg.from.id, msg.chat.id, msg.from.first_name, msg.chat.title, tags)
                .then(() => {
                    setTimeout(function () {
                        getSubscriptions(msg);
                    }, 1000);
                })
                .catch(error => {
                    return bot.sendMessage(msg.from.id, 'error add')
                });
        }
        if ((chatType === 'group' || chatType ==='supergroup')){
            return bot.sendMessage(msg.chat.id, `you can create subscription in private chat only`, {parseMode:'Markdown', replyToMessage:msg.message_id});
        }
    };

    var deleteSubscription = function(msg, id){
        var userId = msg.from.id;
        subscriptionController.RemoveSubscription(id)
            .then(() => subscriptionController.GetUserSubscriptions(userId))
            .then(subs => {
                if (subs === undefined || subs.length === 0) {
                    const [chatId, messageId] = lastMessage;
                    return bot.editMessageText({chatId, messageId}, `you have no subscriptions`);
                }
                else {
                    var buttons = [];
                    subs.forEach(subscription => {
                        buttons.push([bot.inlineButton(`${subscription.tag} 🗑`, {callback: subscription._id})]);
                    });
                    let replyMarkup = bot.inlineKeyboard(buttons);
                    const [chatId, messageId] = lastMessage
                    return bot.editMessageReplyMarkup({chatId, messageId}, {replyMarkup});
                }
            })
            .then(re => {
                lastMessage = [msg.from.id, re.result.message_id];
            })
            .catch(error => {
                return bot.sendMessage(msg.from.id, 'error delete')
            });
    }

    bot.on('sticker', function(msg){
        stickerController.OnNewMessage(msg);
    });

    bot.on('newChatMembers', function(msg){
        var botId = bot.getMe().id;
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