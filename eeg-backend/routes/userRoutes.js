const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

// Signup Route
router.post('/signup', async (req, res) => {
  const {
    doctorID = null, // optional, or generate on backend
    name, email, contact,
    hospital, age, username, password
  } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const existing = await Doctor.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      doctorID, name, email, contact, hospital,
      age, username, password: hashedPassword
    });

    await newDoctor.save();
    res.status(201).json({ success: true, message: "Doctor registered successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please provide username and password" });
  }

  try {
    const doctor = await Doctor.findOne({ username });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { password: pwd, ...doctorData } = doctor.toObject(); // exclude password from response

    res.status(200).json({ success: true, message: "Login successful", doctor: doctorData });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
