/**
 * Created by admin on 5/14/2017.
 */
config = {};
config.progConfChatId = -1001092067303;
config.port = 3000;

config.telegram = {};
config.mongo = {};
config.plotly = {};

config.mongo.url = "mongodb://progconf:progconf@ds062889.mlab.com:62889/progconf_db";
config.telegram.token = "383827700:AAFwMdfp1O2tN6auJkiwWaf2TwAvk5ecC5k";

config.plotly.username = "progconf";
config.plotly.api_key = "7mjosJUdPMLs8CPguUWf";
config.herokuUrl = "http://progconfbot.herokuapp.com";
config.apiStat = "/stat/chat/";

module.exports = config;
