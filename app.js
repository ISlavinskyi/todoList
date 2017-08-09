var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),   
    path = require('path');

var db = mongoose.connect('mongodb://localhost/todo');
var todoList = require('./Models/userModel');

var app = express();
var port = 3000;

userRouter = require('./Routes/userRoutes')(todoList);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// userRouter = require('./Routes/userRoutes')(userData);

app.use('/api',express.static(path.join(__dirname, 'public')), userRouter);

app.listen(port, function () {
    console.log('Server start on ' + port)
});