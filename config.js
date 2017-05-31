/**
 * Created by admin on 5/14/2017.
 */
config = {};
config.progConfChatId = -1001092067303;
config.port = 3000;

config.plotly = {};

config.plotly.username = "progconf";
config.plotly.api_key = "7mjosJUdPMLs8CPguUWf";
config.herokuUrl = "http://progconfbot.herokuapp.com";
config.apiStat = "/stat/chat/:chatId";
config.apiRoot = "/api";
config.apiMessagesStat = "/stat/messages/:chatId";
config.apiStickersStat = "/stat/stickers/:chatId";
config.apiMessagesByUserStat = "/stat/top/messages/:chatId";
config.apiStickersByUserStat = "/stat/top/stickers/:chatId";
config.apiTotalActivity = "/stat/total/:chatId";
config.apiTodayActivity = "/stat/today/:chatId";


module.exports = config;
