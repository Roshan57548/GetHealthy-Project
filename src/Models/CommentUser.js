const mongoose = require("mongoose");

const CommentUser = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  todayDate: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  }
  
});


const CommentUsers = mongoose.model("CommentUser", CommentUser);

module.exports = CommentUsers;
