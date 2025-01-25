const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'principal'],
    required: [true, 'Role is required'],
    index: true
  },
  student_id: {
    type: Number,
    unique: true,
    sparse: true
  },
  teacher_id: {
    type: Number,
    unique: true,
    sparse: true
  },
  principal_id: {
    type: Number,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Get next available user_id
UserSchema.statics.getNextUserId = async function() {
  const lastUser = await this.findOne().sort({ user_id: -1 }).limit(1).lean();
  const lastUserId = lastUser ? Number(lastUser.user_id) : 0;
  return lastUserId + 1;
};

// Get next available ID for specific role
UserSchema.statics.getNextRoleId = async function(role) {
  const lastUser = await this.findOne({ [role + '_id']: { $exists: true } })
    .sort({ [role + '_id']: -1 })
    .limit(1)
    .lean();
  const lastRoleId = lastUser ? Number(lastUser[role + '_id']) : 0;
  return lastRoleId + 1;
};

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for role-specific ID
UserSchema.virtual('role_id').get(function() {
  return this[`${this.role}_id`];
});

// Indexes
UserSchema.index({ student_id: 1 }, { sparse: true });
UserSchema.index({ teacher_id: 1 }, { sparse: true });
UserSchema.index({ principal_id: 1 }, { sparse: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;