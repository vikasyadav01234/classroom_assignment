const Assignment = require('../../models/Assignment');

async function countAssignmentsByGrade() {
  return Assignment.aggregate([
    { $group: { _id: '$grade', count: { $sum: 1 } } }
  ]);
}

module.exports = countAssignmentsByGrade;