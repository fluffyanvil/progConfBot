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

    bot.on(/\W*(\/subscribes\b)\W*/, function(msg){
        getSubscription(msg);
    });

    var addSubscriptions = function (msg) {
        var chatType = msg.chat.type;
        var tags = msg.text.match(/#(\w*[0-9a-zA-Z]+\w*[0-9a-zA-Z])/g);
        console.log(tags);
        if (chatType == 'private')
        {
            subscriptionController.Add(msg.from.id, msg.chat.id, tags);
            if (tags != null)
                msg.reply.text(`you were subscribed to ${tags.join(", ")}`);
        }
        if ((chatType == 'group' || chatType =='supergroup')){
            msg.reply.text(`you can create subscription in private chat only`);
        }
    };

    var getSubscription = function (msg) {
        var chatType = msg.chat.type;
        if (chatType == 'private')
        {
            let replyMarkup = bot.inlineKeyboard([
                [
                    bot.inlineButton('callback', {callback: 'this_is_data'}),
                    bot.inlineButton('inline', {inline: 'some query'})
                ], [
                    bot.inlineButton('url', {url: 'https://telegram.org'})
                ]
            ]);
            subscriptionController.GetUserSubscriptions(msg.from.id, function(result){
                if (result == undefined)
                    msg.reply.text(`you have no subscriptions`);
                else
                    return bot.sendMessage(msg.from.id, 'Inline keyboard example.', {replyMarkup});
                    //msg.reply.text(`all your subscribes: ${result.join(", ")}`, {replyMarkup: replyMarkup});
            });
        }
    };

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