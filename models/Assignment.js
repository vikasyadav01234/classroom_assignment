const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
    minlength: [5, "Content must be at least 5 characters"]
  },
  state: {
    type: String,
    enum: ["DRAFT", "ASSIGNED", "SUBMITTED", "GRADED"], // Verified uppercase
    default: "DRAFT"
  },
  grade: {
    type: String,
    enum: ["A", "B", "C", "D", "F", null],
    default: null
  },
  student_id: {
    type: Number,
    required: true
  },
  teacher_id: Number,
  created_by: {
    type: String,
    enum: ["student", "teacher"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);