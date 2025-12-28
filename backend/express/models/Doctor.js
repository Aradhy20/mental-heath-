const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required']
    },
    availability: {
        type: String,
        default: 'Mon-Sat: 10AM - 6PM'
    }
}, {
    timestamps: true
});

// Create a 2dsphere index for location-based queries
DoctorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Doctor', DoctorSchema);
