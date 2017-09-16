var SubscriptionModel = require('../models/SubscriptionModel').SubscriptionModel;

module.exports = function () {
    module = {};
    module.AddSubscriptions = function (userId, chatId, firstName, chatTitle, tags) {
        return new Promise((resolve, reject) => {
            if (tags === null) reject();
            tags.forEach(function(tag, index, array) {
                SubscriptionModel.findOneAndUpdate({
                    userId: userId,
                    chatId: chatId,
                    tag: tag
                }, {
                    userId: userId,
                    chatId: chatId,
                    userFirstName: firstName,
                    chatTitle: chatTitle,
                    tag: tag
                }, {
                    upsert:true
                }, function (err, item){
                    if (err) reject(err);
                    else {

                    }
                });
            });
            resolve();
        });
    };
    module.GetTagsSubscriptions = function (tags) {
        return new Promise((resolve, reject) => {
            SubscriptionModel.aggregate(
                [
                    {
                        $match : {
                            tag : {
                                $in : tags
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            userId : { $first: '$userId' }
                        }
                    }
                ],
                function(err, docs){
                    if (err) reject(Error(err));
                    resolve(docs);
                }
            );
        });
    };
    module.GetUserSubscriptions = function (userId) {
        return new Promise(function(resolve, reject) {
            SubscriptionModel
                .find({userId:userId}, function (error, result) {
                    if (error){
                        console.log(error);
                        reject(Error("It broke"));
                    }
                    else {
                        resolve(result);
                    }
                });
        });
    };
    module.GetChatSubscriptions = function (userId, chatId) {
        return new Promise((resolve, reject) => {
            SubscriptionModel
                .find({ })
                .where('userId').eq(userId)
                .where('chatId').eq(chatId)
                .exec(function(error, result) {
                    if (error) reject(Error("It broke"));
                    resolve(result);
                });
        });
    };

    module.RemoveSubscription = function(id){
        return new Promise((resolve, reject) => {
            SubscriptionModel.remove({ _id : id }, function (error) {
                if (error) reject(error);
                else resolve();
            });
        });
    };
    return module;
};