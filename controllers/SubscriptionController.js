var SubscriptionModel = require('../models/SubscriptionModel').SubscriptionModel;

module.exports = function () {
    module = {};
    module.Add = function (userId, chatId, tags) {
        if (tags == null) return;
        tags.forEach(function callback(tag, index, array) {
            SubscriptionModel.findOneAndUpdate({
                tag : tag
            }, {
                userId: userId,
                chatId: chatId,
                tag: tag
            }, {
                upsert:true
            }, function (err, item){
                if (err) console.log(err);
            });
        });

    };
    module.GetTagsSubscriptions = function (tags) {
        SubscriptionModel.find({
            'tag': { $in: tags}
        }, function(err, docs){
            return docs;
        });
    };
    module.GetUserSubscriptions = function (userId, callback) {
        SubscriptionModel.find({userId:userId}, function(error, result){
            if (error) console.log(error);
            else{
                callback(result);
            }
        })
    };
    module.GetChatSubscriptions = function (userId, chatId) {
        SubscriptionModel
            .find({})
            .where('userId').eq(userId)
            .where('chatId').eq(chatId)
            .exec(function(error, result){
                return result;
            })
    }
    return module;
}