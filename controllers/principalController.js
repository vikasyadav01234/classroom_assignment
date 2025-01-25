const User = require('../models/User');
const Assignment = require('../models/Assignment');

exports.listTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('user_id teacher_id createdAt updatedAt');
    res.json({ data: teachers });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      state: { $in: ['SUBMITTED', 'GRADED'] }
    })
      .sort({ submitted_at: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
    
  } catch (error) {
    console.error('Principal List Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assignments'
    });
  }
};
exports.regradeAssignment = async (req, res) => {
  try {
    const { id, grade } = req.body;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.grade = grade;
    await assignment.save();

    res.json({ data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

