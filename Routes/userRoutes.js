var express = require('express'),
    path = require('path');

var routes = function (userData) {
    var userRouter = express.Router();

    userRouter.route('/todoListData')
        .post(function (req, res) {
            var postData = new userData(req.body);
            postData.save();
            res.status(201).send('hello');
        })
        .get(function (req, res) {
            console.log('here');
            res.status(201).send('get');
        });
    return userRouter;
};
module.exports = routes;