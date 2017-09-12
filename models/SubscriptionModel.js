var mongoose = require("mongoose");
var subscriptionSchema = mongoose.Schema({
    userId: Number,
    chatId: Number,
    tag: String
});

var SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
    SubscriptionModel : SubscriptionModel
}