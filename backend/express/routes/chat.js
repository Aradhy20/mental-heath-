const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   POST api/chat/send
// @desc    Send message to AI Chatbot
// @access  Private
router.post('/send', auth, async (req, res) => {
    try {
        // Forward request to Python Chatbot Service (Port 8009)
        const response = await axios.post('http://localhost:8009/v1/chat', {
            user_id: req.user.id,
            message: req.body.message
        });
        res.json(response.data);
    } catch (err) {
        console.error('Chat Service Error:', err.message);
        // Fallback response if AI is offline
        res.json({
            response: "I'm having trouble connecting to my brain right now, but I'm here for you. Could you try again in a moment?",
            sentiment: 'neutral'
        });
    }
});

// @route   GET api/chat/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:8009/v1/chat/history/${req.user.id}`);
        res.json(response.data);
    } catch (err) {
        console.error('Chat History Error:', err.message);
        res.json({ history: [] });
    }
});

module.exports = router;
