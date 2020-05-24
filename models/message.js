const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name:{
        type:String
    },
    created_at:{
        type:String
    }
});

module.exports = mongoose.model('Message',messageSchema);