const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (e.g. images and common document types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents (PDF/DOC) are allowed.'));
  }
};

const upload = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// S3 Upload Helper (if credentials are set in environment)
const uploadToS3IfConfigured = async (file) => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
    // If S3 is not configured, return local path (URL format)
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${file.filename}`;
  }

  try {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const fileStream = fs.createReadStream(file.path);
    const key = `uploads/${Date.now()}-${path.basename(file.path)}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Cleanup local file after successful S3 upload
    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to delete local temp file after S3 upload:', err);
    });

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.warn('S3 Upload failed, falling back to local file URL:', error.message);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${file.filename}`;
  }
};

module.exports = {
  upload,
  uploadToS3IfConfigured
};
