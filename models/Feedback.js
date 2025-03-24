const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    comments: String,
    date: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; // Corrected the typo
