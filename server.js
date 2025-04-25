const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// OTP Storage
const otpStore = {};

// MongoDB Setup
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/quizdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Define Question Schema
const questionSchema = new mongoose.Schema({
  question: String,
  options: {
    A: String,
    B: String,
    C: String,
    D: String
  },
  correctAnswer: String
});
const Question = mongoose.model('Question', questionSchema);

// Email Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ammumallampati31@gmail.com', // ✅ Your Gmail
    pass: 'eetd ayhd huay xscs'         // ✅ App Password
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ✅ SEND OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { email, name, loginType } = req.body;

  if (!email || !name || !loginType) {
    return res.json({ success: false, message: 'Missing required fields' });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[email] = otp;

  const mailOptions = {
    from: 'ammumallampati31@gmail.com',
    to: email,
    subject: 'Your OTP for Online Examination Login',
    text: `Hi ${name},\n\nYour OTP for login is: ${otp}\n\n- Online Examination System`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending failed:', error);
      res.json({ success: false, message: 'Failed to send OTP' });
    } else {
      console.log('Email sent:', info.response);
      res.json({ success: true });
    }
  });
});

// ✅ VERIFY OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid OTP' });
  }
});

// ✅ SAVE QUESTIONS TO DATABASE
app.post('/api/save-questions', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Invalid questions format" });
    }

    await Question.insertMany(questions);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving questions:", err);
    res.status(500).json({ success: false, message: "Server error while saving questions" });
  }
});

// ✅ CLEAR ALL QUESTIONS FROM DATABASE
app.delete('/api/clear-all-questions', async (req, res) => {
  try {
    await Question.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error("Error clearing questions:", err);
    res.status(500).json({ success: false, message: "Server error while clearing questions" });
  }
});

// GET QUESTIONS
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().limit(5); // Get 5 questions
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// SUBMIT QUIZ RESULTS
app.post('/api/submit-quiz', async (req, res) => {
  try {
    // You can store results in database if needed
    console.log("Quiz submitted:", req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
