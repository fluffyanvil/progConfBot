var mongoose = require("mongoose");
var subscriptionSchema = mongoose.Schema({
    userId: Number,
    userFirstName: String,
    chatId: Number,
    chatTitle: String,
    tag: String
});

var SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
    SubscriptionModel : SubscriptionModel
}