const asyncHandler = require('express-async-handler');
const ragService = require('../services/ragService');

// @desc    Upload a PDF/TXT document, extract + chunk + index it for retrieval
// @route   POST /api/rag/upload
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded. Attach a PDF or TXT file under the "file" field.');
    }

    try {
        const result = await ragService.ingestDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message || 'Failed to process document');
    }
});

// @desc    Ask a question about a previously uploaded document
// @route   POST /api/rag/ask
// @access  Private
const askDocument = asyncHandler(async (req, res) => {
    const { docId, question } = req.body;
    if (!docId || !question) {
        res.status(400);
        throw new Error('docId and question are required');
    }

    try {
        const result = await ragService.answerQuestion(docId, question);
        res.json(result);
    } catch (error) {
        res.status(400);
        throw new Error(error.message || 'Failed to answer question');
    }
});

// @desc    Remove an uploaded document from memory
// @route   DELETE /api/rag/:docId
// @access  Private
const removeDocument = asyncHandler(async (req, res) => {
    ragService.deleteDocument(req.params.docId);
    res.json({ success: true });
});

module.exports = { uploadDocument, askDocument, removeDocument };
