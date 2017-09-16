/**
 * Created by admin on 5/16/2017.
 */
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM
});

let telegram = function(){
    let lastMessage;
    bot.start();
    const joinedUserController = require('../controllers/JoinedUserController')();
    const userController = require('../controllers/UserController')();
    const messageController = require('../controllers/MessageController')();
    const stickerController = require('../controllers/StickerController')();
    const chatController = require('../controllers/ChatController')();
    const subscriptionController = require('../controllers/SubscriptionController')();

    let getSubscriptions = function(msg){
        subscriptionController.GetUserSubscriptions(msg.from.id)
            .then(subs => {
                if (subs === undefined || subs === null || subs.length === 0)
                    return bot.sendMessage(msg.from.id, `you have no subscriptions`);
                else {
                    var buttons = [];
                    subs.forEach(subscription => {
                        buttons.push([bot.inlineButton(`${subscription.tag} 🗑`, {callback: subscription._id})]);
                    });
                    let replyMarkup = bot.inlineKeyboard(buttons);
                    console.log(replyMarkup);
                    return bot.sendMessage(msg.from.id, 'Your subs', {replyMarkup});
                }
            })
            .then(re => {
                lastMessage = [msg.from.id, re.result.message_id];
            })
            .catch(error => {
                return bot.sendMessage(msg.from.id, 'error')
            });
    };

    let deleteSubscription = function(msg, id){
        const userId = msg.from.id;
        subscriptionController.RemoveSubscription(id)
            .then(() => subscriptionController.GetUserSubscriptions(userId))
            .then(subs => {
                if (subs === undefined || subs.length === 0) {
                    const [chatId, messageId] = lastMessage;
                    return bot.editMessageText({chatId, messageId}, `you have no subscriptions`);
                }
                else {
                    const buttons = [];
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
    };

    bot.on('text', function(msg) {
        messageController.OnNewMessage(msg);
        userController.OnNewMessage(msg);
        chatController.OnNewMessage(msg);
        let chatType = msg.chat.type;
        let tags = msg.text.match(/#([^\s]*)/g);
        if ((chatType === 'group' || chatType ==='supergroup')){
            if (tags !== null)
                subscriptionController
                    .GetTagsSubscriptions(tags)
                    .then(subs => {
                        notifyUser(msg, subs);
                    })
                    .catch(error => {});
        }
        if (chatType === 'private')
        {
            if (tags === undefined || tags === null || tags.length === 0)
                return bot.sendMessage(msg.from.id, 'use #hashtags');
            subscriptionController.AddSubscriptions(msg.from.id, msg.chat.id, msg.from.first_name, msg.chat.title, tags)
                .then(() => {
                    setTimeout(function () {
                        getSubscriptions(msg);
                    }, 1000);
                })
                .catch(error => {
                    return bot.sendMessage(msg.from.id, 'error in add')
                });
        }

    });
    
    let notifyUser = function (msg, subscriptions) {
        return new Promise((resolve, reject) => {
            subscriptions.forEach((sub, index, array) => {
                bot.sendMessage(sub.userId, `https://t.me/${msg.chat.username}/${msg.message_id}`);
            });
        });
    };

    bot.on(/\W*(\/subscribes\b)\W*/, function (msg) {
        const chatType = msg.chat.type;
        if (chatType === 'private')
        {
            getSubscriptions(msg);
        }
    });

    bot.on('callbackQuery', msg => {
        deleteSubscription(msg, msg.data);
    });

    bot.on('sticker', function(msg){
        stickerController.OnNewMessage(msg);
    });

    bot.on('newChatMembers', function(msg){
        const botId = bot.getMe().id;
        const user = msg.new_chat_member;
        if (user.id === botId)
            return;
        let message = '*У нас новый участник!*\n';
        message = message.concat(`*Ohayō gozaimasu,* [${ user.first_name == null ? '' : user.first_name }${ user.last_name == null ? '' : ' ' + user.last_name }](tg://user?id=${user.id})!\n`);
        message = message.concat('*Каковы твои возраст, стек технологий, зп,* _ориентация_*?*\n');
        message = message.concat('*Кем видишь себя через 5 лет сидения в этом чате?*');
        joinedUserController.OnUserJoined(msg);
        return bot.sendMessage(msg.chat.id, message, {parseMode:'Markdown'});
    });

    bot.on(/(^\/chart)/, function(msg){
        msg.reply.text(`http://progconfbotvue.herokuapp.com/chats/${msg.chat.id}`)
    });
};

module.exports.Telegram = telegram;