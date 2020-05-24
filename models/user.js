const mongoose = require("mongoose");

const userSchama = new mongoose.Schema({
  name: {
    type: String
  },
  username: {
    type: String
  },
  sex: {
    type: Number,
    default: 0
  },
  age: {
    type: Number
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: Number,
    default: 0
  },
  block: {
    type: Number,
    default: 0
  },
  viewers: {
    type: String
  },
  img: {
    type: String
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString()
  },
  time: {
    type: String,
    default: new Date().toLocaleTimeString()
  },
  ip: {
    type: String
  }
});

module.exports = mongoose.model("User", userSchama);
