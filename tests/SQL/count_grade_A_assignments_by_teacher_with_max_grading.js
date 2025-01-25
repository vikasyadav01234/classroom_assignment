const Assignment = require('../../models/Assignment');

async function countGradeAAssignments() {
  return Assignment.aggregate([
    { $match: { grade: 'A' } },
    { $group: { _id: '$teacher_id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
}

module.exports = countGradeAAssignments;