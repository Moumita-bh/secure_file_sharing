const File = require('../models/File');
const path = require('path');
const jwt = require('jsonwebtoken');

exports.uploadFile = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: 'No file uploaded' });

  const allowedExtensions = ['.docx', '.pptx', '.xlsx'];
  const ext = path.extname(req.file.originalname);
  if (!allowedExtensions.includes(ext))
    return res.status(400).json({ message: 'Invalid file type' });

  try {
    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadedBy: req.user._id
    });
    res.status(201).json({ message: 'File uploaded', fileId: file._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.generateDownloadLink = async (req, res) => {
  const { id } = req.params;
  try {
    const token = jwt.sign({ fileId: id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });
    const link = `http://localhost:${process.env.PORT}/api/files/download/${token}`;
    res.status(200).json({ downloadLink: link });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const file = await File.findById(decoded.fileId);
    if (!file) throw new Error('File not found');

    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    res.download(filePath, file.originalName);
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired link' });
  }
};
