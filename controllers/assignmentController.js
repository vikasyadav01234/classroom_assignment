const Assignment = require('../models/Assignment');
const { isValidObjectId } = require('mongoose');

// Helper function to validate grade
const isValidGrade = (grade) => ['A', 'B', 'C', 'D', 'F', null].includes(grade);

// List all assignments for a student
exports.listAssignments = async (req, res) => {
  try {
    if (!req.principal.student_id) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    const assignments = await Assignment.find({ student_id: req.principal.student_id })
      .sort({ created_at: -1 })
      .lean();

    res.json({ data: assignments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new draft assignment
exports.createAssignment = async (req, res) => {
  try {
    const { student_id } = req.principal;
    
    if (!student_id) {
      return res.status(403).json({ error: 'Student access required' });
    }

    const { content } = req.body;
    
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ error: 'Content must be at least 5 characters' });
    }

    const newAssignment = await Assignment.create({
      content: content.trim(),
      student_id,
      state: 'DRAFT'
    });

    res.status(201).json({ data: newAssignment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

// Edit a draft assignment
exports.editAssignment = async (req, res) => {
  try {
    const { student_id } = req.principal;
    const { id, content } = req.body;

    if (!student_id) {
      return res.status(403).json({ error: 'Student access required' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    const assignment = await Assignment.findOne({
      _id: id,
      student_id,
      state: 'DRAFT'
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or not editable' });
    }

    if (!content || content.trim().length < 5) {
      return res.status(400).json({ error: 'Content must be at least 5 characters' });
    }

    assignment.content = content.trim();
    assignment.updated_at = Date.now();
    await assignment.save();

    res.json({ data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

// Submit an assignment to teacher
exports.submitAssignment = async (req, res) => {
  try {
    const { student_id } = req.principal;
    const { id, teacher_id } = req.body;

    if (!student_id) {
      return res.status(403).json({ error: 'Student access required' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    if (!teacher_id || typeof teacher_id !== 'number') {
      return res.status(400).json({ error: 'Valid teacher ID required' });
    }

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: id,
        student_id,
        state: 'DRAFT'
      },
      {
        teacher_id,
        state: 'SUBMITTED',
        updated_at: Date.now()
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or already submitted' });
    }

    res.json({ data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
};

// Common grade validation middleware
exports.validateGrade = (req, res, next) => {
  const { grade } = req.body;
  
  if (!isValidGrade(grade)) {
    return res.status(400).json({ error: 'Invalid grade value' });
  }
  
  next();
};