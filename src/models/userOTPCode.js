const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userOTPCode = new Schema(
  {
    mobile: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10
    },
    code: Number,
    isValid: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserOTPCode", userOTPCode);
