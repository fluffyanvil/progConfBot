var mongoose = require("mongoose");
var subscriptionSchema = mongoose.Schema({
    userId: Number,
    chatId: Number,
    word: String

});

var SubscriptionModel = mongoose.model('Sticker', subscriptionSchema);

module.exports = {
    SubscriptionModel : SubscriptionModel
}