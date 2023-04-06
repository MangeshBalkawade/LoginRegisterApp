const express = require("express");
const users = require("../models/users.js");
const app = express();
const nodemailer = require("nodemailer");

app.get("/check", (req, res) => {
  res.status(200).send("Server is Working");
});

//////////////////////  Register API /////////////////////////////////

app.post("/register", async (req, res) => {
  try {
    // User Name Validation
    const user_name = req.body.user_name;
    const email_regex = /^[a-zA-Z0-9._%+-]+@(gmail|email)\.(com|in)$/;
    if (!email_regex.test(user_name)) {
      return res
        .status(422)
        .json({ error: "Please Provide User Name in Proper Format" });
    }

    //Password Validation
    const password = req.body.password;
    const password_regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password_regex.test(password)) {
      return res
        .status(422)
        .json({ error: "Please Provide Password in Proper Format" });
    }

    // Body Validation
    if (req.body == undefined) {
      return res
        .status(422)
        .json({ error: "Username and Password Is Required" });
    }

    // Checking for user is aleready exist
    const all_users = await users.find({});
    for (let i = 0; i < all_users.length; i++) {
      let user = all_users[i];
      if (user.user_name == req.body.user_name) {
        return res.status(409).json({ error: "User Name Is Aleready Exist" });
      }
    }

    // Save User
    new_User = new users(req.body);
    new_User.save();

    // Email Sending Code
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "SenderMailId@gmail.com", // Mail Id
        pass: "Password", // Password
      },
    });

    let mailOptions = {
      from: '"Name Of Sender" <@gmail.com>',
      to: user_name,
      subject: "Thank You for Registering On Our Website!",
      text:
        "Dear " +
        user_name +
        ",\nWe wanted to take a moment to thank you for visiting our website.\nWe hope that you found the information you were looking for and that your experience was a positive one,At Tech Curve And Ai Ltd.\nWe are always striving to provide the best possible experience for our customers, and your feedback is incredibly valuable to us.\nIf you have any suggestions or feedback that you'd like to share, please don't hesitate to reach out to us.\nThank you again for your visit, and we hope to see you again soon!\nBest regards,\nTech Curve And AI",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      //console.log("Message sent: %s", info.messageId);
    });

    return res.status(201).json({
      message:
        "User created successfully with mail id " +
        user_name +
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
    // User Name Validation
    const user_name = req.body.user_name;
    const email_regex = /^[a-zA-Z0-9._%+-]+@(gmail|email)\.(com|in)$/;
    if (!email_regex.test(user_name)) {
      return res
        .status(422)
        .json({ error: "Please Provide User Name in Proper Format" });
    }

    // Password Validation
    const password = req.body.password;
    const password_regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password_regex.test(password)) {
      return res
        .status(422)
        .json({ error: "Please Provide Password in Proper Format" });
    }

    //Check for user is present or not
    users_all = await users.find({});
    for (let i = 0; i < users_all.length; i++) {
      let user = users_all[i];
      if (
        user.user_name == req.body.user_name &&
        user.password == req.body.password
      ) {
        return res.status(200).json({ message: "Login Successfully" });
      }

      // Validation for invalid password
      if (user.user_name == req.body.user_name) {
        if ((user.password == req.body.password) == false) {
          return res.status(401).json({ error: "Password is Incorrect" });
        }
      }
    }

    return res.status(401).json({ error: "Please Register to Login" });
  } catch (err) {
    return res.status(500).json({ error: "Unable to Login" });
  }
});

////////////////////////////////////////////////////////////////////////////////////

module.exports = app;
