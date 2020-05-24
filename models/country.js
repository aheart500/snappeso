const mongoose = require('mongoose');

countrySchama = new mongoose.Schema({
    name:{
        type:String
    },
    created_at:{
        type:String
    }
});

module.exports = mongoose.model('Country',countrySchama);