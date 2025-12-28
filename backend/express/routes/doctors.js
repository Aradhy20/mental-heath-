const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');

// @route   POST api/doctors/nearby
// @desc    Get doctors nearby using current location (MongoDB Geospatial)
// @access  Private
router.post('/nearby', auth, async (req, res) => {
    try {
        const { lat, lon, maxDistance = 50000 } = req.body; // maxDistance in meters (default 50km)

        if (lat === undefined || lon === undefined) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        // MongoDB GeoNear query
        const doctors = await Doctor.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).limit(10);

        // Map doctors to include calculated distance for frontend display
        // MongoDB $near sorts by distance automatically
        const doctorsWithDistance = doctors.map(doc => {
            // Note: MongoDB doesn't return distance in find(), 
            // but we can calculate it or use aggregate $geoNear if precise km display is needed.
            // For now, we'll return the results.
            return {
                id: doc._id,
                name: doc.name,
                specialty: doc.specialization,
                address: doc.address,
                contact: doc.contact,
                rating: doc.rating,
                // Simple Euclidean approx for display if needed, but [lon, lat] is stored.
                // Re-calculating distance using Haversine for the UI
                distance: getDistance(lat, lon, doc.location.coordinates[1], doc.location.coordinates[0])
            };
        });

        res.json(doctorsWithDistance);
    } catch (err) {
        console.error('Doctor Search Error:', err.message);
        res.status(500).json({ message: 'Failed to find nearby specialists' });
    }
});

// Helper to calculate distance (Haversine Formula) for UI display
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = router;
