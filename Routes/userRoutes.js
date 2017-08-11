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
            obj = {
                a: 'sdf',
                b: 23
            }
            var query = req.query;
            userData.find(query, function (err, data) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.status(302).send(obj);
                }
            })
        });
    return userRouter;
};
module.exports = routes;