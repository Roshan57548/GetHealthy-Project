const mongoose = require("mongoose");

const AmazonLink = new mongoose.Schema({
    Link: {
    type: String,
    required: true,
  }
});

const MyAmazonLink = mongoose.model("AmazonLink", AmazonLink);

module.exports = MyAmazonLink;
