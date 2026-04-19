const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext)
                         .replace(/[^a-z0-9]/gi, '-')
                         .toLowerCase()
                         .slice(0, 40);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeBase}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else    cb(new Error('Only image files are allowed (jpg/png/webp/gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
});

module.exports = { upload, UPLOAD_DIR };
