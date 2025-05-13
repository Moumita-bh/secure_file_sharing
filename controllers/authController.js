const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const url = `http://localhost:${process.env.PORT}/api/auth/verify/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Verify Email',
      html: `Click <a href="${url}">here</a> to verify your email.`
    });

    res.status(201).json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.status(200).json({ message: 'Email verified' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!user.isVerified) throw new Error('Email not verified');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Incorrect password');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
