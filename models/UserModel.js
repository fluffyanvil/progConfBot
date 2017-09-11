/**
 * Created by admin on 9/11/2017.
 */
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    id: Number,
    username: String,
    firstName: String,
    lastName: String
});

var UserModel = mongoose.model('User', userSchema);

module.exports = {
    UserModel: UserModel
}