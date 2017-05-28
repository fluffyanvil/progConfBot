/**
 * Created by admin on 5/21/2017.
 */
var mongo = require('./mongo');
var moment = require('moment');
var packageInfo = require('./../package.json');

module.exports = function(app){
    app.set('view engine', 'pug');
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
        mongo.TopByChatName(req.params.chat, function(result, err){
            if (err) {
                console.log(err);
            }
            res.json(result);
        })
    });

    app.get('/api/messages/stat/:chat', function(req,res){
        mongo.StatByChatName(req.params.chat, function(result, error){
            console.log(result);
            res.json(result);
        });
    });

    app.get('/api/chart/:chatId', function(req,res){
        var stat = {};
        var pie = {};
        mongo.StatByChatId(req.params.chatId.toString(), function(stat, error){
            mongo.TopByChatId(req.params.chatId.toString(), function(pie, error){
                res.render('stat', { title: 'Statistics', message: `${req.params.chat} statistics`, chatname: stat.chatname,  chartdata: stat.data, pie: pie});
            });
        });




    });
}
