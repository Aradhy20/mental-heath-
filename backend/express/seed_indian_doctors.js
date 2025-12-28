const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const indianDoctors = [
    // MUMBAI
    {
        name: "Dr. Ananya Sharma",
        specialization: "Clinical Psychologist",
        address: "Marine Drive, Mumbai, Maharashtra",
        location: { type: "Point", coordinates: [72.8231, 18.9440] },
        rating: 4.8,
        contact: "+91-98765-43210",
        availability: "Mon-Sat: 10AM-6PM"
    },
    {
        name: "Dr. Vikram Mehra",
        specialization: "Psychiatrist",
        address: "Andheri West, Mumbai, Maharashtra",
        location: { type: "Point", coordinates: [72.8273, 19.1197] },
        rating: 4.9,
        contact: "+91-99887-76655",
        availability: "Mon-Fri: 11AM-7PM"
    },
    // DELHI
    {
        name: "Dr. Priyanka Chopra (Consultant)",
        specialization: "Child Psychologist",
        address: "Connaught Place, New Delhi",
        location: { type: "Point", coordinates: [77.2167, 28.6289] },
        rating: 4.7,
        contact: "+91-88776-65544",
        availability: "Mon-Sat: 9AM-5PM"
    },
    {
        name: "Dr. Sameer Malhotra",
        specialization: "Mental Health Specialist",
        address: "Saket, New Delhi",
        location: { type: "Point", coordinates: [77.2100, 28.5244] },
        rating: 4.6,
        contact: "+91-77665-54433",
        availability: "Tue-Sun: 10AM-8PM"
    },
    // BANGALORE
    {
        name: "Dr. Karthik Raj",
        specialization: "Neurologist / Counselor",
        address: "Indiranagar, Bangalore, Karnataka",
        location: { type: "Point", coordinates: [77.6412, 12.9716] },
        rating: 4.9,
        contact: "+91-91234-56789",
        availability: "Mon-Fri: 9AM-4PM"
    },
    {
        name: "Dr. Kavita Murthy",
        specialization: "Therapist",
        address: "Koramangala, Bangalore, Karnataka",
        location: { type: "Point", coordinates: [77.6245, 12.9352] },
        rating: 4.8,
        contact: "+91-82345-67890",
        availability: "Mon-Sat: 11AM-7PM"
    },
    // HYDERABAD
    {
        name: "Dr. Sreenivas Rao",
        specialization: "Psychiatrist",
        address: "Banjara Hills, Hyderabad, Telangana",
        location: { type: "Point", coordinates: [78.4411, 17.4162] },
        rating: 4.7,
        contact: "+91-73456-78901",
        availability: "Mon-Sat: 10AM-6PM"
    }
];

async function seedDoctors() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mental_health_db');
        console.log('✅ Connected to MongoDB for seeding doctors');

        // Clear existing doctors
        await Doctor.deleteMany({});
        console.log('🗑️  Cleared existing doctor records');

        // Insert new doctors
        await Doctor.insertMany(indianDoctors);
        console.log(`✨ Successfully seeded ${indianDoctors.length} Indian specialists into MongoDB`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
}

seedDoctors();
