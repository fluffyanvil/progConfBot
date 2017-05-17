/**
 * Created by admin on 5/14/2017.
 */
var packageInfo = require('./package.json');
var config = require('./config');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.json({ version: packageInfo.version });
});

app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Web server started at http://%s:%s', host, port);
});

var telegram = require('./libs/telegram')
telegram.Telegram();
