const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

const multer = require('multer');
const FormData = require('form-data');
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/analysis/text
// @desc    Analyze text using Python AI Service
// @access  Private
router.post('/text', auth, async (req, res) => {
    try {
        const response = await axios.post(`${process.env.AI_TEXT_SERVICE_URL}/v1/analyze/text`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('AI Service Error:', err.message);
        res.status(500).json({ message: 'AI Analysis failed', error: err.message });
    }
});

// @route   POST api/analysis/text/contextual
// @desc    Analyze text with contextual understanding (RAG)
// @access  Private
router.post('/text/contextual', auth, async (req, res) => {
    try {
        const response = await axios.post(`${process.env.AI_TEXT_SERVICE_URL}/v1/analyze/text/contextual`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Contextual AI Error:', err.message);
        res.status(500).json({ message: 'Contextual AI Analysis failed', error: err.message });
    }
});

// @route   POST api/analysis/face
// @desc    Analyze facial expression using Python AI Service
// @access  Private
router.post('/face', auth, async (req, res) => {
    try {
        const response = await axios.post(`${process.env.AI_FACE_SERVICE_URL}/v1/analyze/face`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Face Service Error:', err.message);
        res.status(500).json({ message: 'Face Analysis failed', error: err.message });
    }
});

// @route   POST api/analysis/voice
// @desc    Analyze voice using Python AI Service
// @access  Private
router.post('/voice', auth, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No audio file provided' });

        const form = new FormData();
        form.append('audio_file', req.file.buffer, {
            filename: 'voice_input.webm',
            contentType: req.file.mimetype,
        });
        form.append('user_id', req.body.user_id || '1');

        const response = await axios.post(
            `${process.env.AI_VOICE_SERVICE_URL}/v1/analyze/voice`,
            form,
            { headers: { ...form.getHeaders() } }
        );
        res.json(response.data);
    } catch (err) {
        console.error('Voice Service Error:', err.message);
        res.status(500).json({ message: 'Voice Analysis failed', error: err.message });
    }
});

// @route   POST api/analysis/fuzzy
// @desc    Advanced Fuzzy Logic Assessment for Mental Wellness
// @access  Private
router.post('/fuzzy', auth, async (req, res) => {
    try {
        const { calculateWellnessScore } = require('../utils/fuzzyLogic');
        // Inputs: Mood Score (0-10), Sentiment Score (-1 to 1), Energy Level (0-10)
        // If exact values aren't provided, use defaults
        const { mood_score, sentiment_score, energy_level } = req.body;

        const assessment = calculateWellnessScore(
            parseFloat(mood_score) || 5,
            parseFloat(sentiment_score) || 0,
            parseInt(energy_level) || 5
        );

        res.json({
            status: "success",
            method: "Advanced Fuzzy Logic Engine",
            result: assessment
        });
    } catch (err) {
        console.error('Fuzzy Logic Error:', err.message);
        res.status(500).json({ message: 'Analysis failed' });
    }
});

// @route   POST api/analysis/report
// @desc    Generate a wellness report
// @access  Private
router.post('/report', auth, async (req, res) => {
    try {
        // In a real system, this would call a PDF generator or report microservice
        res.json({
            status: "success",
            message: "Wellness report generated and synchronized with your portal.",
            report_id: "REP-" + Date.now(),
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: 'Report generation failed' });
    }
});

module.exports = router;
