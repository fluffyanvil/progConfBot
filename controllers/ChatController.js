/**
 * Created by admin on 9/11/2017.
 */
var ChatModel = require('../models/ChatModel').ChatModel;

module.exports = function(){
    module = {};

    module.AddOrUpdate = function(msg){
        ChatModel.findOneAndUpdate({
            id: msg.chat.id
        }, {
            id: msg.chat.id,
            title: msg.chat.title
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });
    };

    module.FindOne = function (chatId, callback) {
        ChatModel.findOne({id: chatId}, function(e, r){
            if (e) {

            }
            else{

                callback({data: result, chatname: r ? r.title : null}, null);
            }
        });
    };
    module.OnNewMessage = function (msg) {
        ChatModel.findOneAndUpdate({
            id: msg.chat.id
        }, {
            id: msg.chat.id,
            title: msg.chat.title
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });
    }
    return module;
};