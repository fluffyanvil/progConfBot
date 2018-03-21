/**
 * Created by admin on 5/21/2017.
 */
const moment = require('moment');
const packageInfo = require('./../package.json');

module.exports = function(app){
    const messagesController = require('../controllers/MessageController')();
    const stickersController = require('../controllers/StickerController')();
    const joinedUsersController = require('../controllers/JoinedUserController')();
    const usersController = require('../controllers/UserController')();
    app.set('view engine', 'pug');
    app.get('/', function (req, res) {
        res.json({ version: packageInfo.version });
    });

    // new api
    app.get('/api2/users/last/:chatId', (req, res) => {
        const chatId = parseInt(req.params.chatId);
        joinedUsersController
            .GetLastJoinedUsers(chatId, 5)
            .then(users => {
                res.json(users);
            })
            .catch(err => {
                res.status(500).send({ error: err })
            })
    });

    app.get('/api2/:type/total/:chatId', (req, res) => {
        const chatId = parseInt(req.params.chatId);
        const controller = req.params.type.toLowerCase() === 'messages' ? messagesController : stickersController;
        controller
            .Count(chatId)
            .then(count => {
                res.json({'total' : count});
            })
            .catch(err => {
                res.status(500).send({ error: err })
            });
    });

    app.get('/api2/:type/stat/:chatId', (req, res) => {
        const chatId = parseInt(req.params.chatId);
        const today = moment.utc().startOf('day');
        const yesterday = moment.utc().add(-1, 'days').startOf('day');
        let stat = {};
        const controller = req.params.type.toLowerCase() === 'messages' ? messagesController : stickersController;

        controller
            .Count(chatId, today, null)
            .then(t => {
                stat.todayCount = t;
            })
            .then(() => controller.Count(chatId, yesterday, today))
            .then(y => {
                stat.yesterdayCount = y;
                if (y > 0)
                    stat.percentage = Math.round((stat.todayCount / stat.yesterdayCount) * 100);
                stat.trend = stat.yesterdayCount > stat.todayCount ? -1 : (stat.yesterdayCount < stat.todayCount ? 1 : 0);
                res.json(stat);
            })
            .catch(err => {
                res.status(500).send({ error: err })
            });
    });

    app.get('/api2/:type/trend/:chatId', (req, res) => {
        const chatId = parseInt(req.params.chatId);
        const startDate = moment.utc().add(-1, 'months').startOf('day').format();

        const controller = req.params.type.toLowerCase() === 'messages' ? messagesController : stickersController;
        controller
            .Stat(chatId, startDate)
            .then(stat => {
                res.json(stat)
            })
            .catch(err => {
                res.status(500).send({ error: err })
            })
    });

    app.get('/api2/:type/top/:chatId', (req, res) => {
        const chatId = parseInt(req.params.chatId);
        const controller = req.params.toLowerCase() === 'messages' ? messagesController : stickersController;

        let entities;

        controller
            .Top(chatId)
            .then(result => {
                entities = result;
            })
            .then(() => usersController.GetAll())
            .then(users => {
                entities.forEach(message => {
                    const u = users.find(user => {
                        return user.id === message._id;
                    });
                    message.username = u.username;
                    message.firstName = u.firstName;
                    message.lastName = u.lastName;
                });
                res.json(entities);
            })
            .catch(err => {
                res.status(500).send({ error: err })
            });
    });
};
