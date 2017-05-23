/**
 * Created by admin on 5/21/2017.
 */
var mongo = require('./mongo');
var moment = require('moment');
var packageInfo = require('./../package.json');

module.exports = function(app){

    app.get('/', function (req, res) {
        res.json({ version: packageInfo.version });
    });

    app.get('/api/messages/:chat', function(req,res){
        mongo.Message.find({chat: req.params.chat}, function (err, doc){
            if (err) {
                console.log(err);
                return;
            }
            res.json(doc);
        });
    });

    app.get('/api/messages/today/:chat', function(req,res){
        var date = moment.utc().startOf('day');
        mongo.Message
            .find({})
            .where('received').gt(date)
            .where('chat').equals(req.params.chat)
            .exec(function (err, doc){
                if (err) {
                    console.log(err);
                    return;
                }
                res.json(doc);
            });
    });

    app.get('/api/users/name/:username', function(req,res){
        mongo.User.findOne({username: req.params.username}, function (err, doc){
            if (err) {
                console.log(err);
                return;
            }
            res.json(doc);
        });
    });

    app.get('/api/users/id/:id', function(req,res){
        mongo.User.findOne({id: req.params.id}, function (err, doc){
            if (err) {
                console.log(err);
                return;
            }
            res.json(doc);
        });
    });

// {id: Number, chat: String}
    app.get('/api/stat/:id/:chat',  function(req,res){
        mongo.User.findOne({id: req.params.id}, function (err, user){
            if (err) {
                console.log(err);
                return;
            }
            var response = {};
            response.user = user;
            mongo.Message.find({})
                .where('userId').equals(req.params.id)
                .where('chat').equals(req.params.chat)
                .exec(function (err, count){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    response.messages = count.length;
                    res.json(response)});
        });
    });

    app.get('/api/users/chat/:chat', function(req,res){
        mongo.Message
            .find({})
            .where('chat').equals(req.params.chat)
            .distinct('userId')
            .exec(function (err, ids){
                if (err) {
                    console.log(err);
                    return;
                }
                // res.json(doc);
                mongo.User.find({id: {$in: ids}}, function(err, users){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.json(users);
                });
            });
    });

    app.get('/api/messages/top3/:chat', function(req,res){
        mongo.Message.aggregate([
            { $match : { chat : req.params.chat } },
            {
                $group: {
                    _id: '$userId',
                    count: {$sum: 1},
                    username : { $first: '$username' }
                }
            },
            {
                $sort: {
                    "count": -1
                }
            },
            {
                $limit: 3
            },
            {
                $project : {
                    username : 1,
                    count : 1
                }
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}
