/**
 * Created by admin on 9/11/2017.
 */
var JoinedUserModel = require('../models/JoinedUserModel').JoinedUserModel;
var moment = require('moment');
module.exports = function () {
    module = {};
    module.OnUserJoined = function(msg){
        var joinedUser = msg.new_chat_member;
        JoinedUserModel
            .findOneAndUpdate({
                id: joinedUser.id
            }, {
                id: joinedUser.id,
                username: joinedUser.username,
                firstName: joinedUser.first_name,
                lastName: joinedUser.last_name,
                joinDate: moment.unix(msg.date),
                chatId: msg.chat.id
            }, {
                upsert:true
            }, function (err, item){
                if (err) console.log(err);
            });
    };

    module.GetLastJoinedUsers = function(chatId, count, callback){
        JoinedUserModel
            .find({
                chatId: chatId
            })
            .sort({joinDate: -1})
            .limit(count)
            .exec(function(error, users){
                if (error) {
                    callback(null, err)
                }
                else {
                    callback(users, null);
                }
            });
    };
    return module;
}