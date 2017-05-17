/**
 * Created by admin on 5/14/2017.
 */
var config = require('./config');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.json({status: "OK"});
});

app.listen(config.port, function () {
    console.log('Example app listening on port 3000!');
});

var telegram = require('./libs/telegram')
telegram.Telegram();
