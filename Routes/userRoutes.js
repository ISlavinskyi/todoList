var express = require('express'),
    path = require('path');

var routes = function (userData) {
    var userRouter = express.Router();

    userRouter.route('/todoListData')
        .post(function (req, res) {
            var Data = new userData(req.body);
            Data.save();
            res.status(201);
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
            });
        });
    userRouter.route('/todoListData/:id')
        .put(function (req, res) {
            userData.findOne({id:req.body.id}, function(err, data){
                data.completed = !data.completed; 
                data.save();
            });

        })
        .delete(function (req, res) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(204);
            }
        });
    return userRouter;
};
module.exports = routes;