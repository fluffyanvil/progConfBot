/**
 * Created by admin on 5/17/2017.
 */

var express = require('express');
var app = express();

require('./routes')(app);

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
});