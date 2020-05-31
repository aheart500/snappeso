const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  site_name: String,
  site_description: String,
  vip_message: String,
  vip_per_page: Number,
  normal_per_page: Number
});

module.exports = mongoose.model("Setting", settingsSchema);
