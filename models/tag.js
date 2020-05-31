const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: String,
  link: String
});

module.exports = mongoose.model("Tag", tagSchema);
