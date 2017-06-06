/**
 * Created by admin on 5/17/2017.
 */
var express = require('express');
var cors = require('cors')
var app = express();
app.use(express.static('public'));
app.use(cors());
require('./routes')(app);

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);

});