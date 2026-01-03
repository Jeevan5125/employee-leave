const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  user: String,
  type: String,
  from: String,
  to: String,
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Request", RequestSchema);
