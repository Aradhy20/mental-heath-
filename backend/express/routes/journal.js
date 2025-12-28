const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Journal = require('../models/Journal');

// @route   POST api/journal
// @desc    Create journal entry
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, mood_label, sentiment_score, is_private } = req.body;

        const newJournal = new Journal({
            user: req.user.id,
            title: title || 'Untitled Entry',
            content,
            mood_label,
            sentiment_score,
            is_private: is_private !== undefined ? is_private : true
        });

        const journal = await newJournal.save();
        res.json(journal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/journal
// @desc    Get all journal entries for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const entries = await Journal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ entries });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/journal/:id
// @desc    Delete a journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const entry = await Journal.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        // Check user
        if (entry.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
