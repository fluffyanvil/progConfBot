/**
 * Created by admin on 9/11/2017.
 */
const ChatModel = require('../models/ChatModel').ChatModel;

module.exports = function(){
    module = {};

    module.Get = (chatId) => {
        return ChatModel.findOne({id: chatId});
    };

    module.OnNewMessage = function (msg) {
        ChatModel.findOneAndUpdate({
            id: msg.chat.id
        }, {
            id: msg.chat.id,
            title: msg.chat.title,
            username: msg.chat.username
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });
    };
    return module;
};