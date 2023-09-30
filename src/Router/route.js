const express = require("express");
const router = express.Router();
var cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const authenticateuser = require("../Middleware/AuthenticateUser");
const authenticateadmin = require("../Middleware/AuthenticateAdmin");

// -------- Database Connected --------------
require("../Database/Connection");
// --------Database Registration  Schema --------------
const RegistrationUser = require("../Models/RegistrationUser");
// --------Database E-Book  Schema --------------
const eBook = require("../Models/eBookUser");
// --------Database Admin  Schema --------------
const Admin = require("../Models/Admin");
// --------Database Comment  Schema --------------
const CommentUsers = require("../Models/CommentUser");
// --------Database Admin Comment  Schema --------------
const AdminCommentUsers = require("../Models/AdminComment");
// --------Database Admin AmazonLink  Schema --------------
const MyAmazonLink = require("../Models/AmazonLink");

//  ------------------------------- eBook registration route ------------------------------------ //
router.post("/eBook", async (req, res) => {
  let { EmailAddress } = req.body;

  if (!EmailAddress) {
    return res.status(421).json({ error: "All field are required" });
  }
  try {
    const UserExist = await eBook.findOne({ email: EmailAddress }); //checking if user exists already

    if (UserExist) {
      res.status(201).json({ message: "User email already exist" });
    } else {
      const eBookregistered = new eBook({
        email: EmailAddress,
      });

      await eBookregistered.save();
      res.status(201).json({ message: "Email Registered Successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- registration route ------------------------------------ //
router.post("/Sign-Up", async (req, res) => {
  let { firstName, LastName, email, mobileNumber, password, confirmPassword } =
    req.body;

  if (
    !firstName ||
    !LastName ||
    !email ||
    !mobileNumber ||
    !password ||
    !confirmPassword
  ) {
    return res.status(421).json({ error: "All field are required" });
  }

  try {
    const UserExist = await RegistrationUser.findOne({ email: email }); //checking if user exists already

    if (UserExist) {
      res.status(422).json({ error: "User email already exist" });
    } else if (password !== confirmPassword) {
      res.status(423).json({ error: "Passwords does not match correctly" });
    } else {
      const todayDate = new Date().toISOString().slice(0, 10);
      const registered = new RegistrationUser({
        firstName,
        LastName,
        email,
        mobileNumber,
        todayDate,
        password,
      });

      await registered.save();

      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: "gethealthywithmanish@gmail.com",
          pass: "mvmkfyojcvorqrzx",
        },
      });

      var option = {
        from: "gethealthywithmanish@gmail.com",
        to: email,
        subject: "Registered Successfully",
        html: `<div>
    <p>Hi ${firstName},</p>
    <p>Congratulations, your account has been successfully created.</p>
    <p>If you experience any issues logging into your account, reach out to us at gethealthywithmanish@gmail.com</p>
    <p>Regards</p>
    <p><strong>Team GetHealthy</strong></p>
    </div>`,
      };

      transporter.sendMail(option, (err, info) => {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
      res.status(201).json({ message: "User registered successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Login route ------------------------------------ //

router.post("/Sign-In", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const UserLogin = await RegistrationUser.findOne({
      email: email,
    });

    if (UserLogin) {
      const isMatch = await bcrypt.compare(password, UserLogin.password);

      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credential" });
      } else {
        token = await UserLogin.generateAuthtoken();

        res.cookie("UserTokens", token, {
          expires: new Date(Date.now() + 5184000),
          secure: true,
          // httpOnly: true,
          // domain: "www.gethealthy.co.in",
          // sameSite: "strict",
        });

        res.json({ message: "Sign In Successfully" });
      }
    } else {
      res.status(404).json({ error: "Invalid Credential" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Admin Login route ------------------------------------ //

router.post("/Admin/Sign-In", async (req, res) => {
  try {
    let Admintoken;
    const { EmailAddress, Password } = req.body;

    if (!EmailAddress || !Password) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const AdminLogin = await Admin.findOne({
      email: EmailAddress,
    });

    if (AdminLogin) {
      const AdminisMatch = await bcrypt.compare(Password, AdminLogin.password);

      if (!AdminisMatch) {
        res.status(400).json({ error: "Invalid Credential" });
      } else {
        Admintoken = await AdminLogin.generateAuthtoken();

        res.cookie("AdminTokens", Admintoken, {
          expires: new Date(Date.now() + 5184000),
          secure: true,
          // httpOnly: true,
          // domain: "www.gethealthy.co.in",
          // sameSite: "strict",
        });

        res.json({ message: "Sign In Successfully" });
      }
    } else {
      res.status(404).json({ error: "Invalid Credential" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Reset Password Route ------------------------------------ //

router.post("/Reset-Password-OTP", async (req, res) => {
  try {
    const { EmailAddress } = req.body;

    if (!EmailAddress) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const UserLogin = await RegistrationUser.findOne({
      email: EmailAddress,
    });

    if (UserLogin) {
      const OTP = Math.floor(100000 + Math.random() * 900000);
      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: "gethealthywithmanish@gmail.com",
          pass: "mvmkfyojcvorqrzx",
        },
      });

      var option = {
        from: "connect@agbiztech.in",
        to: EmailAddress,
        subject: "OTP",
        html: `<div>
        <p>Hi ${UserLogin.firstName}</p>
        <p>Forgot your password?</p>
        <p>We received a request to reset the password for your account.</p>
        <p>To reset the password, Kindly check the given below OTP.</p>
        <p><strong>${OTP}</strong></p>
        <p>Regards</p>
        <p><strong>Team GetHealthy</strong></p>
        </div>`,
      };

      transporter.sendMail(option, (err, info) => {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
      res
        .status(200)
        .json({ success: "Email Sent Successfully", MainOtp: OTP });
    } else {
      res.status(404).json({ error: "Email Does Not Exist" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Admin Reset Password Route ------------------------------------ //

router.post("/Admin/Reset-Password-OTP", async (req, res) => {
  try {
    const { EmailAddress } = req.body;

    if (!EmailAddress) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const AdminLogins = await Admin.findOne({
      email: EmailAddress,
    });

    if (AdminLogins) {
      const AdminOTP = Math.floor(100000 + Math.random() * 900000);
      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: "gethealthywithmanish@gmail.com",
          pass: "mvmkfyojcvorqrzx",
        },
      });

      var option = {
        from: "connect@agbiztech.in",
        to: EmailAddress,
        subject: "OTP",
        html: `<div>
        <p>Hi ${AdminLogins.firstName}</p>
        <p>Forgot your password?</p>
        <p>We received a request to reset the password for your account.</p>
        <p>To reset the password, Kindly check the given below OTP.</p>
        <p><strong>${AdminOTP}</strong></p>
        <p>Regards</p>
        <p><strong>Team GetHealthy</strong></p>
        </div>`,
      };

      transporter.sendMail(option, (err, info) => {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
      res
        .status(200)
        .json({ success: "Email Sent Successfully", AdminMainOtp: AdminOTP });
    } else {
      res.status(404).json({ error: "Email Does Not Exist" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Resend Password Route ------------------------------------ //

router.post("/Resend-Password-OTP", async (req, res) => {
  try {
    const { EmailAddress } = req.body;

    if (!EmailAddress) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const UserLogin = await RegistrationUser.findOne({
      email: EmailAddress,
    });

    if (UserLogin) {
      const OTP = Math.floor(100000 + Math.random() * 900000);
      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: "gethealthywithmanish@gmail.com",
          pass: "mvmkfyojcvorqrzx",
        },
      });

      var option = {
        from: "connect@agbiztech.in",
        to: EmailAddress,
        subject: "OTP",
        html: `<div>
        <p>Hi ${UserLogin.firstName}</p>
        <p>Forgot your password?</p>
        <p>We received a request to reset the password for your account.</p>
        <p>To reset the password, Kindly check the given below OTP.</p>
        <p><strong>${OTP}</strong></p>
        <p>Regards</p>
        <p><strong>Team GetHealthy</strong></p>
        </div>`,
      };

      transporter.sendMail(option, (err, info) => {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
      res
        .status(200)
        .json({ success: "Email Sent Successfully", MainOtp: OTP });
    } else {
      res.status(404).json({ error: "Email Does Not Exist" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  -------------------------------Admin Resend Password Route ------------------------------------ //

router.post("/Admin/Resend-Password-OTP", async (req, res) => {
  try {
    const { EmailAddress } = req.body;

    if (!EmailAddress) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    const AdminManishLogin = await Admin.findOne({
      email: EmailAddress,
    });

    if (AdminManishLogin) {
      const AdminManishOTP = Math.floor(100000 + Math.random() * 900000);
      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
          user: "gethealthywithmanish@gmail.com",
          pass: "mvmkfyojcvorqrzx",
        },
      });

      var option = {
        from: "connect@agbiztech.in",
        to: EmailAddress,
        subject: "OTP",
        html: `<div>
        <p>Hi ${AdminManishLogin.firstName}</p>
        <p>Forgot your password?</p>
        <p>We received a request to reset the password for your account.</p>
        <p>To reset the password, Kindly check the given below OTP.</p>
        <p><strong>${AdminManishOTP}</strong></p>
        <p>Regards</p>
        <p><strong>Team GetHealthy</strong></p>
        </div>`,
      };

      transporter.sendMail(option, (err, info) => {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
      res.status(200).json({
        success: "Email Sent Successfully",
        AdminManishOTPMainOtp: AdminManishOTP,
      });
    } else {
      res.status(404).json({ error: "Email Does Not Exist" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Update Password Route ------------------------------------ //

router.post("/Update-Password-School", async (req, res) => {
  try {
    const { values, Email } = req.body;
    const { NewPassword, ConfirmPassword } = values;
    const EmailAddress = Email["EmailAddress"];
    if (!NewPassword || !ConfirmPassword) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    if (NewPassword === ConfirmPassword) {
      const SchoolLogin = await RegistrationUser.findOne({
        email: EmailAddress,
      });
      const bcryptNewPassword = await bcrypt.hash(NewPassword, 12);
      const registered_school = await RegistrationUser.findByIdAndUpdate(
        { _id: SchoolLogin._id },
        { password: bcryptNewPassword }
      );

      await registered_school.save();
      res.status(200).json({ success: "Password Updated Successfully" });
    } else {
      res.status(404).json({ error: "Passwords must match" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  -------------------------------Admin Update Password Route ------------------------------------ //

router.post("/Admin/Update-Password-School", async (req, res) => {
  try {
    const { values, Email } = req.body;
    const { NewPassword, ConfirmPassword } = values;
    const EmailAddress = Email["EmailAddress"];
    if (!NewPassword || !ConfirmPassword) {
      res.status(400).json({ error: "Please Filled the data" });
    }
    if (NewPassword === ConfirmPassword) {
      const SchoolLogin = await Admin.findOne({
        email: EmailAddress,
      });
      const bcryptNewPassword = await bcrypt.hash(NewPassword, 12);
      const registered_admin = await Admin.findByIdAndUpdate(
        { _id: SchoolLogin._id },
        { password: bcryptNewPassword }
      );

      await registered_admin.save();
      res.status(200).json({ success: "Password Updated Successfully" });
    } else {
      res.status(404).json({ error: "Passwords must match" });
    }
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Get Login User Data Route ------------------------------------ //

router.get("/GetUser", authenticateuser, (req, res) => {
  res.send(req.rootUser);
});

//  ------------------------------- Get User Data Route ------------------------------------ //

router.get("/GetUserData", authenticateuser, (req, res) => {
  res.send(req.rootUser);
});

//  ------------------------------- logout user route ------------------------------------ //

router.get("/Logout", (req, res) => {
  res.clearCookie("AdminTokens", { path: "/" });
  res.clearCookie("UserTokens", { path: "/" });
  res.status(200).json({ message: "logged out succesfully" });
});

// <-------------------------- route to check Admin login ------------------>

router.get("/Admin/Check/Login", authenticateadmin, async (req, res) => {
  res.send(req.rootUser);
});

// <-------------------------- route to check Admin customer data ------------------>

router.get("/Admin/Dashboard/AllCustomers", async (req, res) => {
  try {
    const result = await RegistrationUser.find();
    res.status(201).json({ data: result });
  } catch (err) {
    console.log(err);
  }
});

// <-------------------------- route to check Admin Comment data ------------------>

router.get("/Admin/Dashboard/AllCommentData", async (req, res) => {
  try {
    const result = await AdminCommentUsers.find();
    res.status(201).json({ data: result });
  } catch (err) {
    console.log(err);
  }
});

// <-------------------------- route to check Admin customer data ------------------>

router.get("/Admin/Dashboard/ViewFeedback", async (req, res) => {
  try {
    const result = await AdminCommentUsers.find();
    res.status(201).json({ data: result });
  } catch (err) {
    console.log(err);
  }
});

// <-------------------------- route to check Admin customer data ------------------>

router.post("/Admin/Dashboard/DeleteFeedback", async (req, res) => {
  try {
    const { _id } = req.body;
    await AdminCommentUsers.deleteOne({ _id });
    res.status(201).json({ message: "Deleted Successfully" });
  } catch (err) {
    console.log(err);
  }
});

// <-------------------------- route to check Admin customer feedback data ------------------>

router.get("/Admin/Dashboard/CustomerFeedback", async (req, res) => {
  try {
    const result = await CommentUsers.find();
    res.status(201).json({ data: result });
  } catch (err) {
    console.log(err);
  }
});

// <-------------------------- route to check Admin amazon link  data ------------------>

router.get("/Admin/Dashboard/MyAmazonLink", async (req, res) => {
  try {
    const result = await MyAmazonLink.find();
    res.status(201).json({ data: result });
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- comment route ------------------------------------ //
router.post("/PostComment", async (req, res) => {
  let { firstName, LastName, email, mobileNumber, comment } = req.body;

  if (!firstName || !LastName || !email || !mobileNumber || !comment) {
    return res.status(421).json({ error: "All field are required" });
  }

  try {
    const todayDate = new Date().toISOString().slice(0, 10);
    const commentuser = new CommentUsers({
      firstName,
      LastName,
      email,
      mobileNumber,
      todayDate,
      comment,
    });
    await commentuser.save();
    res.status(200).json({ success: "Comment Post Successfully" });
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Admin comment route ------------------------------------ //
router.post("/Admin/PostComment", async (req, res) => {
  let { FirstName, LastName, DateOfBirth, ShortBio } = req.body;
  if (!FirstName || !LastName || !DateOfBirth || !ShortBio) {
    return res.status(421).json({ error: "All field are required" });
  }

  try {
    const commentuser = new AdminCommentUsers({
      FirstName,
      LastName,
      DateOfBirth,
      ShortBio,
    });
    await commentuser.save();
    res.status(200).json({ success: "Comment Post Successfully" });
  } catch (err) {
    console.log(err);
  }
});

//  ------------------------------- Admin comment route ------------------------------------ / /
router.put("/Admin/AmazonLink", async (req, res) => {
  let { ShortBio } = req.body;

  if (!ShortBio) {
    return res.status(421).json({ error: "All field are required" });
  }

  try {
    const commentuser = await MyAmazonLink.updateOne(
      { _id: "65115f5e067ab34d35caa47d" },
      { $set: { Link: ShortBio } }
    );
    res.status(200).json({ success: "Comment Post Successfully" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
