const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var accountSid = process.env.TWILIOACCOUNTSID;
var authToken = process.env.TWILIOAUTHTOKEN;

var Twilio = require("twilio");
var twilio = new Twilio(accountSid, authToken);

const User = require("../../models/user");
const UserOTPCode = require("../../models/userOTPCode");

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exists already");
      }
      const mobile = args.userInput.mobile.replace(/[^\d]/g, "");
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
        mobile: mobile
      });
      const result = await user.save();
      return { ...result._doc, password: null, mobile: null };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("User does not exist");
      }
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        throw new Error("Password is incorrect!");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.SECRET1,
        { expiresIn: "1h" }
      );

      return { userId: user.id, token: token, tokenExpiration: 1 };
    } catch (err) {
      throw err;
    }
  },
  otpCodeRequest: async ({ mobile }) => {
    try {
      const trimMobile = mobile.replace(/[^\d]/g, "");
      const user = await User.findOne({ mobile: trimMobile });
      if (!user) {
        throw new Error("Invalid mobile number");
      }
      const code = Math.floor(Math.random() * 8999 + 1000);

      const message = await twilio.messages.create({
        body: "Aum Namah Shivaya : " + code,
        to: user.mobile,
        from: process.env.TWILIONUMBER
      });
      if (!message) {
        throw new Error("Network Error");
      }
      //console.log(message);

      const userotpcode = new UserOTPCode({
        mobile: user.mobile,
        code: code,
        isValid: true
      });
      await userotpcode.save();

      return "Aum Namah Shivaya: Code Sent Successfully";
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  otpCodeVerify: async ({ mobile, code }) => {
    try {
      const trimMobile = mobile.replace(/[^\d]/g, "");
      const codeVerify = await UserOTPCode.findOne({
        mobile: trimMobile,
        code: code
      });
      if (!codeVerify || !codeVerify.isValid) {
        throw new Error("Invalid Credentials / Passcode expired");
      }
      //console.log(codeVerify);
      codeVerify.isValid = false;
      await codeVerify.save();
      //console.log(codeVerify);
      const user = await User.findOne({ mobile: codeVerify.mobile });
      if (!user) {
        throw new Error("User does not exist");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.SECRET1,
        { expiresIn: "1h" }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
