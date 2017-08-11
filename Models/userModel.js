var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userModel = new Schema({
    id: { type: Number },
    title: { type: String },
    date: { type: String },
    priority: { type: Number },
    comleted: { type: Boolean },
}, { collection: 'todoList' });

module.exports = mongoose.model('todoList', userModel);