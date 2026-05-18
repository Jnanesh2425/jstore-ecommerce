//code is responsible for saving user signup data into the MongoDB database using Mongoose.
const userModel = require("../../models/userModel.js")
const bcrypt = require('bcryptjs');

async function userSignUpController(req, res) {
  try {
    const email = req.body.email.trim().toLowerCase(); // normalize email
    const { password, name, profilePic } = req.body; // Destructuring user data from the request body

    //to make sure same email is not doing singup 
    const user = await userModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: 'User already exists',
        error: true,
        success: false,
      });
    }

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
        error: true,
        success: false,
      });
    }

    //for converting password into hash using bcryptjs
    const salt = await bcrypt.genSalt(10);  // 10 is number of salt rounds, it controls the computational cost
    const hashPassword = await bcrypt.hash(password, salt);  

    if (!hashPassword) {
      throw new Error('somthing went wrong')
    }

    const payload = {
      name,
      email,
      password: hashPassword,
      profilePic,
      role: 'GENERAL'
    }

    const userData = new userModel(payload);  // Creating a new user document based on the userModel schema
    const savedUser = await userData.save();    // Saving the user document to the MongoDB database

    // added status(201) for successful creation
    res.status(201).json({
      message: 'User registered successfully',
      data: savedUser,
      success: true,
      error: false
    });

  } catch (err) {
    // Handling any errors and sending error response
    res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = userSignUpController;
