/**
 * Created by admin on 5/16/2017.
 */
const _ = require('underscore');
const TeleBot = require('telebot');
const punycode = require('punycode');
const bot = new TeleBot({
    token: process.env.TELEGRAM
});

let telegram = function(){
    let lastMessage;
    let botObject;
    bot.start();
    bot.getMe().then(b => {botObject = b});
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
        processMessage(msg);
    });

    bot.on('photo', function(msg) {
        processMessage(msg);
    });
    bot.on('video', function(msg) {
        processMessage(msg);
    });
    bot.on('audio', function(msg) {
        processMessage(msg);
    });

    let processMessage = (msg) => {
        let text = (msg.caption === null || msg.caption === undefined) ? msg.text : msg.caption;
        if (text.startsWith('/start'))
        {
            text = `#${punycode.decode(text.split(' ')[1])}`;
        }
        if (text !== null){
            messageController.OnNewMessage(msg);
            userController.OnNewMessage(msg);
            chatController.OnNewMessage(msg);
            let chatType = msg.chat.type;


            if ((chatType === 'group' || chatType ==='supergroup')){
                var tags = [];
                var entities = msg.entities;

                if (entities !== null && entities !== undefined)
                {
                    var hashtags = _.filter(entities, function(e){ return e.type ==="hashtag"; });
                    hashtags.forEach(h => {
                        var tag = text.substr(h.offset, h.length);
                        tags.push(tag);
                    })
                }
                if (tags !== null && tags !== undefined && tags.length > 0)
                    subscriptionController
                        .GetTagsSubscriptions(tags)
                        .then(subs => {
                            var buttons = [];

                            tags.forEach(tag => {

                                buttons.push([bot.inlineButton(`Subscribe: ${tag}`, {url: `https://telegram.me/${botObject.username}?start=${punycode.encode(tag.substr(1))}`})]);
                            });
                            let replyMarkup = bot.inlineKeyboard(buttons);
                            bot.sendMessage(msg.chat.id, 'Subscribe to:', {replyMarkup});
                            notifyUser(msg, subs);
                        })
                        .catch(error => {});
            }
            if (chatType === 'private')
            {
                if (text === null)
                    return bot.sendMessage(msg.from.id, 'use #hashtags');
                let tags = [text];
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
        }
    };

    bot.on('edit', (msg) => {
        processMessage(msg);
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
        const user = msg.new_chat_member;
        if (user.id === botObject.id)
            return;

        userController.Exist(user.id).then(exist => {
            let message = ''
            const mention = `[${ (user.first_name === null || user.first_name === undefined) ? '' : user.first_name }${ (user.last_name === null || user.last_name === undefined) ? '' : ' ' + user.last_name }](tg://user?id=${user.id})!\n`
            if (!exist) {
                message = '*У нас новый участник!*\n';
                message = message.concat(`*Ohayō gozaimasu,* ${mention}`);
                message = message.concat('*Каковы твои возраст, стек технологий, зп,* _ориентация_*?*\n');
                message = message.concat('*Кем видишь себя через 5 лет сидения в этом чате?*\n');
                message = message.concat('#all');
            } else {
                message = 'С возвращением, ';
                message = message.concat(mention);
            }
            if (user.id === 476249930) {
                message = 'Ты опять выходишь на связь, мудило?'
            }
            
            joinedUserController.OnUserJoined(msg);
            subscriptionController
                .GetTagsSubscriptions(['#all'])
                .then(subs => {
                    notifyUser(msg, subs);
                })
                .catch(error => {});
            return bot.sendMessage(msg.chat.id, message, {parseMode:'Markdown'});
        })
    });

    bot.on('leftChatMember', (msg) => {
        const user = msg.left_chat_member;
        if (user.id === botObject.id)
            return;
        let message = '*Нас покинул* ';
        message = message.concat(`[${ (user.first_name === null || user.first_name === undefined) ? '' : user.first_name }${ (user.last_name === null || user.last_name === undefined) ? '' : ' ' + user.last_name }](tg://user?id=${user.id})!\n`);
        message = message.concat('*Помянем...*\n');
        message = message.concat('#all');
        subscriptionController
            .GetTagsSubscriptions(['#all'])
            .then(subs => {
                notifyUser(msg, subs);
            })
            .catch(error => {});
        return bot.sendMessage(msg.chat.id, message, {parseMode:'Markdown'});
    });

    bot.on(/(^\/chart)/, function(msg){
        msg.reply.text(`http://progconfbotvue.herokuapp.com/chats/${msg.chat.id}`)
    });
};

module.exports.Telegram = telegram;