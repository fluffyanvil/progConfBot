/**
 * Created by admin on 5/17/2017.
 */
var packageInfo = require('./../package.json');
var express = require('express');
var app = express();
var mongo = require('./mongo');
var moment = require('moment');

app.get('/', function (req, res) {
    res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Web server started at http://%s:%s', host, port);
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
    var offset = moment.unix(msg.date).utcOffset();
    var date = moment.utc().startOf('day');
    var newDate = moment(date).add(-1 * offset, 'm');
    mongo.Message
        .find({})
        .where('received').gt(newDate)
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