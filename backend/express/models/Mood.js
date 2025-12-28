const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    label: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ''
    },
    energy_level: {
        type: Number,
        min: 1,
        max: 10
    },
    activities: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Mood', MoodSchema);
