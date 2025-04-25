const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: {
    A: String,
    B: String,
    C: String,
    D: String
  },
  correctAnswer: String
});

module.exports = mongoose.model("Question", QuestionSchema);
