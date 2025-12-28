const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Mood = require('../models/Mood');

// @route   POST api/mood
// @desc    Log user mood
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { score, label, note, activities, energy_level } = req.body;

        const newMood = new Mood({
            user: req.user.id,
            score: score || 5,
            label: label || req.body.mood_label,
            note: note || req.body.notes,
            activities: activities || [],
            energy_level: energy_level || 5
        });

        const mood = await newMood.save();
        res.json(mood);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/mood
// @desc    Get user mood history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const moods = await Mood.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(moods);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
