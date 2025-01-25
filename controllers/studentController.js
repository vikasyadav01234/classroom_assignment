const Assignment = require('../models/Assignment');
const { isValidObjectId } = require('mongoose');

exports.listAssignments = async (req, res) => {
  try {
    // Get authenticated student ID from JWT
    const studentId = req.user.student_id;

    // Fetch assignments for the logged-in student
    const assignments = await Assignment.find({ student_id: studentId })
      .sort({ created_at: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { student_id } = req.user;
    const { content } = req.body;

    // Validate input
    if (!content || content.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: "Content must be at least 5 characters"
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      content: content.trim(),
      student_id,
      state: "DRAFT",
      created_by: "student"
    });

    res.status(201).json({
      success: true,
      data: assignment
    });

  } catch (error) {
    console.error("Assignment Creation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message // Include actual error message
    });
  }
};

exports.editAssignment = async (req, res) => {
  try {
    const { student_id } = req.user;
    const { id } = req.body;
    const { content } = req.body;

    // Validate assignment ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment ID'
      });
    }

    // Validate content
    if (!content || content.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Content must be at least 5 characters'
      });
    }

    // Find and update draft assignment
    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: id,
        student_id,
        state: 'DRAFT'
      },
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found or not editable'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    });
  }
};


exports.submitAssignment = async (req, res, next) => {
  try {
    const { id: assignmentId, teacher_id } = req.body;
    const studentId = req.user.student_id;

    // Validate teacher exists
    const teacher = await User.findOne({ 
      teacher_id,
      role: 'teacher' 
    });
    
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    // Update assignment
    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: assignmentId,
        student_id: studentId,
        state: 'DRAFT'
      },
      {
        teacher_id,
        state: 'SUBMITTED',
        submitted_at: Date.now()
      },
      { new: true }
    );

    if (!assignment) {
      return next(new AppError('Assignment not found or already submitted', 404));
    }

    res.status(200).json({
      success: true,
      data: assignment
    });

  } catch (error) {
    next(error);
  }
};