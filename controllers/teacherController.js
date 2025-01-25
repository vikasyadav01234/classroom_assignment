const Assignment = require('../models/Assignment');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.listAssignments = async (req, res, next) => {
  try {
    // Get teacher ID from JWT token
    const teacherId = req.user.teacher_id;
    
    // Validate teacher ID exists
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        error: "Teacher ID missing in token"
      });
    }

    // Fetch assignments
    const assignments = await Assignment.find({
      teacher_id: teacherId,
      state: { $in: ["SUBMITTED", "GRADED"] }
    }).sort({ updated_at: -1 });

    res.status(200).json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error("Teacher List Error:", error);
    res.status(500).json({
      success: false,
      error: error.message // Show actual error
    });
  }
};
exports.createStudentAssignment = async (req, res, next) => {
  try {
    const { student_id, content, due_date } = req.body;
    
    // Validate input
    if (!student_id || !content) {
      return next(new AppError('Missing student ID or assignment content', 400));
    }

    // Verify student exists
    const student = await User.findOne({ 
      student_id,
      role: 'student' 
    });
    
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    const newAssignment = await Assignment.create({
      content,
      student_id,
      teacher_id: req.user.teacher_id,
      due_date: due_date || Date.now() + 7*24*60*60*1000, // Default 1 week
      state: 'ASSIGNED',
      created_by: 'teacher'
    });

    res.status(201).json({
      status: 'success',
      data: newAssignment
    });
  } catch (err) {
    next(err);
  }
};

exports.gradeAssignment = async (req, res, next) => {
  try {
    const { assignment_id, grade } = req.body;

    // Validate input
    if (!assignment_id || !grade) {
      return next(new AppError('Missing assignment ID or grade', 400));
    }

    const assignment = await Assignment.findOneAndUpdate(
      { 
        _id: assignment_id,
        teacher_id: req.user.teacher_id,
        state: 'SUBMITTED'
      },
      { 
        grade,
        state: 'GRADED',
        graded_at: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return next(new AppError('Assignment not found or already graded', 404));
    }

    res.status(200).json({
      status: 'success',
      data: assignment
    });
  } catch (err) {
    next(err);
  }
};