/**
 * Created by admin on 9/11/2017.
 */
const UserModel = require('../models/UserModel').UserModel;

module.exports = function () {
    module = {};
    module.OnNewMessage = function(msg){
        UserModel.findOneAndUpdate({
            id : msg.from.id
        }, {
            id: msg.from.id,
            username: msg.from.username,
            firstName: msg.from.first_name,
            lastName: msg.from.last_name
        }, {
            upsert:true
        }, function (err, item){
            if (err) console.log(err);
        });
    };

    module.Exist = (id) => {
        return UserModel.find({id: id}).then(user => {
            if (!user) {
                return Promise.resolve(false)
            } else {
                return Promise.resolve(true)
            }
        })
    }

    module.GetAll = () => {
        return new Promise((resolve, reject) => {
            UserModel.find({}, (err, result) => {
                if (err) reject(Error(err));

                resolve(result);
            })
        })
    };

    return module;
};