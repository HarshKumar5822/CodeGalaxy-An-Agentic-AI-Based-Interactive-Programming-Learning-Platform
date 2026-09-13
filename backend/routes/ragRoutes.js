const express = require('express');
const multer = require('multer');
const router = express.Router();
const ragController = require('../controllers/ragController');
const authMiddleware = require('../middleware/authMiddleware');

// Memory storage: files never touch disk, they're extracted and indexed immediately then
// discarded — simplest and safest for a demo, and avoids managing an uploads directory.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB, matches ragService's own check
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const lower = file.originalname.toLowerCase();
        const allowedExt = /\.(pdf|txt|md|jpe?g|png|webp|gif)$/i;
        if (allowed.includes(file.mimetype) || allowedExt.test(lower)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, TXT, and image (JPG/PNG/WEBP/GIF) files are supported'));
        }
    },
});

router.post('/upload', authMiddleware.protect, upload.single('file'), ragController.uploadDocument);
router.post('/ask', authMiddleware.protect, ragController.askDocument);
router.delete('/:docId', authMiddleware.protect, ragController.removeDocument);

module.exports = router;
