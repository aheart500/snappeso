const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true
  },
  text: String,
  type: String,
  created_at: String
});
blogSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Blog", blogSchema);
