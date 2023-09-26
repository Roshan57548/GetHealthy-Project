const mongoose = require("mongoose");

const eBookUser = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  }
});

const eBook = mongoose.model("eBookUser", eBookUser);

module.exports = eBook;
