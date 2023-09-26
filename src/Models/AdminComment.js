const mongoose = require("mongoose");

const AdminCommentUser = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  DateOfBirth: {
    type: String,
    required: true,
  },
  ShortBio: {
    type: String,
    required: true,
  },
});

const AdminCommentUsers = mongoose.model("AdminCommentUser", AdminCommentUser);

module.exports = AdminCommentUsers;
