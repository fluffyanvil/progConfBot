/**
 * Created by admin on 9/11/2017.
 */
const JoinedUserModel = require('../models/JoinedUserModel').JoinedUserModel;
const moment = require('moment');
module.exports = function () {
    module = {};
    module.OnUserJoined = function(msg){
        let joinedUser = msg.new_chat_member;
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

    module.GetLastJoinedUsers = function(chatId, count){
        return new Promise((resolve, reject) => {
            JoinedUserModel
                .find({
                    chatId: chatId
                })
                .sort({joinDate: -1})
                .limit(count)
                .exec(function(error, users){
                    if (error) {
                        reject(Error(error));
                    }
                    else {
                        resolve(users);
                    }
                });
        });
    };
    return module;
};