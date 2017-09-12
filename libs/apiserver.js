/**
 * Created by admin on 5/17/2017.
 */
var express = require('express');
var cors = require('cors')
var app = express();
var mongoose = require('mongoose');
app.use(express.static('public'));
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect(process.env.MONGO, {useMongoClient: true});
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message)
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

require('./routes')(app);

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
});