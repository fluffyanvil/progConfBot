/**
 * Created by admin on 9/11/2017.
 */
var mongoose = require('mongoose');
var chatSchema = mongoose.Schema({
    id: Number,
    title: String
});
var ChatModel = mongoose.model('Chat', chatSchema);
module.exports = {
    ChatModel: ChatModel
}