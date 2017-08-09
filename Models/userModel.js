var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userModel = new Schema({
    id: { type: String },
    title: { type: String },
    comleted: { type: Boolean },
}, { collection: 'todoList' });

module.exports = mongoose.model('todoList', userModel);