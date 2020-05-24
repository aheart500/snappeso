const mongoose = require('mongoose');

const vipSchema = new mongoose.Schema({
    doc:{
        type:String
    }
});

module.exports = mongoose.model('Vip',vipSchema);