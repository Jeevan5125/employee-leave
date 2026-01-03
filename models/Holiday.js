const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema({
  name: String,
  date: String
});

module.exports = mongoose.model("Holiday", HolidaySchema);
