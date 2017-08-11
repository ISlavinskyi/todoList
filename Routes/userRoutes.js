var express = require('express'),
    path = require('path');

var routes = function (userData) {
    var userRouter = express.Router();

    userRouter.route('/todoListData')
        .post(function (req, res) {
            var postData = new userData(req.body);
            console.log(req.body);
            postData.save();
            res.status(200).send('hello');
        })
        .get(function (req, res) {
            var query = req.query;
            userData.find(query, function (err, data) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.status(302).send(data);
                }
            })
        })
    userRouter.route('/todoListData/:id')
        .put(function (req, res) {
            res.status(200);
            console.log(req.body);
        });
    return userRouter;
};
module.exports = routes;