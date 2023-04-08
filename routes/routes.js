const express = require("express");
const users = require("../models/users.js");
const app = express();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

app.get("/check", (req, res) => {
  res.status(200).send("Server is Working");
});

//////////////////////  Register API /////////////////////////////////

app.post("/register", async (req, res) => {
  try {
    // Body Validation
    if (req.body == undefined) {
      return res
        .status(422)
        .json({ error: "Username and Password Is Required" });
    }

    const user = {
      user_name: req.body.user_name,
      password: req.body.password,
    };

    // Email And Password Validation
    const email_regex = /^[a-zA-Z0-9._%+-]+@(gmail|email)\.(com|in)$/;
    const password_regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (
      !email_regex.test(user.user_name) ||
      !password_regex.test(user.password)
    ) {
      return res.status(422).json({
        error: "Please Provide User Name And Password in Proper Format",
      });
    }

    // Checking for user is aleready exist
    const user_exist = await users.findOne({ user_name: user.user_name });

    if (user_exist != null) {
      return res.status(409).json({ error: "User Name Is Aleready Exist" });
    }

    // Save User
    new_User = new users(req.body);
    new_User.save();

    //Email Sending Code
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "@gmail.com", // Mail Id
        pass: "", // Password
      },
    });

    let mailOptions = {
      from: '"name" <@gmail.com>',
      to: user.user_name,
      subject: "Thank You for Registering On Our Website!",
      text:
        "Dear " +
        user.user_name +
        ",\nWe wanted to take a moment to thank you for visiting our website.\nWe hope that you found the information you were looking for and that your experience was a positive one,At Tech Curve And Ai Ltd.\nWe are always striving to provide the best possible experience for our customers, and your feedback is incredibly valuable to us.\nIf you have any suggestions or feedback that you'd like to share, please don't hesitate to reach out to us.\nThank you again for your visit, and we hope to see you again soon!\nBest regards,\nTech Curve And AI",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });

    return res.status(201).json({
      message:
        "User created successfully with mail id " +
        user.user_name +
        " You will recieve confirmation email in few seconds.",
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to Register a User" });
  }
});

///////////////////////////////////////////////////////////////////////////

/////////////////////  Login API /////////////////////////////////////////

app.post("/login", async (req, res) => {
  try {
    // Body Validation
    if (req.body == undefined) {
      return res
        .status(422)
        .json({ error: "Username and Password Is Required" });
    }

    const user = {
      user_name: req.body.user_name,
      password: req.body.password,
    };

    const email_regex = /^[a-zA-Z0-9._%+-]+@(gmail|email)\.(com|in)$/;
    const password_regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (
      !email_regex.test(user.user_name) ||
      !password_regex.test(user.password)
    ) {
      return res.status(422).json({
        error: "Please Provide User Name And Password in Proper Format",
      });
    }

    const user_exist = await users.findOne({ user_name: user.user_name });
    if (user_exist == null) {
      return res.status(401).json({ error: "Please Register to Login" });
    }

    // JWT Authentication
    if (
      user_exist.user_name == user.user_name &&
      user_exist.password == user.password
    ) {
      let payload = {
        subject: user.user_name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      let token = jwt.sign(payload, "secretKey");
      return res.status(200).send({ token });
    } else {
      return res.status(401).json({ error: "Password is Incorrect" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Unable to Login" });
  }
});

// Token Validation
function verifyToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized request");
    }
    let token = req.headers.authorization.split(" ")[1];
    if (token === "null") {
      return res.status(401).send("Unauthorized request");
    }
    let payload = jwt.verify(token, "secretKey");
    if (!payload) {
      return res.status(401).send("Unauthorized request");
    }
    req.body.user_name = payload.subject;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized request");
  }
}

app.post("/profile", verifyToken, (req, res) => {
  res.status(200).send("Welecome to your profile : " + req.body.user_name);
});

////////////////////////////////////////////////////////////////////////////////////

module.exports = app;
