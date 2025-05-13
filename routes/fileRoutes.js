const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadFile,
  listFiles,
  generateDownloadLink,
  downloadFile
} = require('../controllers/fileController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post(
  '/upload',
  authenticate,
  authorize(['ops']),
  upload.single('file'),
  uploadFile
);
router.get('/', authenticate, authorize(['client']), listFiles);
router.get(
  '/generate-link/:id',
  authenticate,
  authorize(['client']),
  generateDownloadLink
);
router.get('/download/:token', authenticate, authorize(['client']), downloadFile);

module.exports = router;
