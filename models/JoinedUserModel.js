/**
 * Created by admin on 9/11/2017.
 */
var mongoose = require('mongoose');
var joinedUserSchema = mongoose.Schema({
    id: Number,
    username: String,
    firstName: String,
    lastName: String,
    joinDate: Date,
    chatId: Number
});

var JoinedUserModel = mongoose.model('JoinedUser', joinedUserSchema);

module.exports = {
    JoinedUserModel : JoinedUserModel
}