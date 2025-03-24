const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    estimated_date: { type: Date, required: true },
    departing_address: { type: String, required: true },
    destination_address: { type: String, required: true },
    type_of_house: { type: String, required: true },
    property_size: { type: String, required: true },
    extra_details: { type: String, required: false }
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;