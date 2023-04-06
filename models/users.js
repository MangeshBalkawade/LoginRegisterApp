const mongoose = require("mongoose");

const users = new mongoose.Schema({ 
  user_name: {
    type: String,
    unique:true
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("users", users);
module.exports = User;
