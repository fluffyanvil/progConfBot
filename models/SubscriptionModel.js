const mongoose = require("mongoose");
const subscriptionSchema = mongoose.Schema({
    userId: Number,
    userFirstName: String,
    chatId: Number,
    chatTitle: String,
    tag: String
});

const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
    SubscriptionModel : SubscriptionModel
}