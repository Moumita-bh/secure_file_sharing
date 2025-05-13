const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['ops', 'client'], default: 'client' },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
