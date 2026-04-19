const { success, error } = require('../utils/response');

// POST /api/upload (single)
exports.uploadSingle = (req, res) => {
  if (!req.file) return error(res, 'No file uploaded', 400);
  const url = `/uploads/${req.file.filename}`;
  return success(res, { url, filename: req.file.filename, size: req.file.size });
};

// POST /api/upload/multiple
exports.uploadMultiple = (req, res) => {
  if (!req.files || !req.files.length) return error(res, 'No files uploaded', 400);
  const urls = req.files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
  }));
  return success(res, urls);
};
