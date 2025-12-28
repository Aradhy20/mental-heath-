const mongoose = require('mongoose');
require('dotenv').config();

const DoctorSchema = new mongoose.Schema({
    name: String,
    specialization: String,
    address: String,
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
    },
    rating: Number,
    contact: String,
    availability: String
}, { timestamps: true });

DoctorSchema.index({ location: '2dsphere' });

const Doctor = mongoose.model('Doctor', DoctorSchema);

// Sample doctors across major Indian cities
const sampleDoctors = [
    // Delhi NCR
    {
        name: "Dr. Priya Sharma",
        specialization: "Clinical Psychologist",
        address: "Apollo Hospital, Sarita Vihar, New Delhi",
        location: { type: "Point", coordinates: [77.2855, 28.5355] },
        rating: 4.8,
        contact: "+91-11-2654-3210",
        availability: "Mon-Sat: 9AM - 6PM"
    },
    {
        name: "Dr. Rajesh Kumar",
        specialization: "Psychiatrist",
        address: "Max Hospital, Patparganj, Delhi",
        location: { type: "Point", coordinates: [77.2977, 28.6358] },
        rating: 4.7,
        contact: "+91-11-4567-8901",
        availability: "Mon-Fri: 10AM - 5PM"
    },
    {
        name: "Dr. Anita Verma",
        specialization: "Counseling Psychologist",
        address: "Fortis Hospital, Vasant Kunj, New Delhi",
        location: { type: "Point", coordinates: [77.1570, 28.5244] },
        rating: 4.9,
        contact: "+91-11-6789-0123",
        availability: "Tue-Sun: 11AM - 7PM"
    },

    // Mumbai
    {
        name: "Dr. Vikram Patel",
        specialization: "Psychiatrist",
        address: "Lilavati Hospital, Bandra West, Mumbai",
        location: { type: "Point", coordinates: [72.8311, 19.0596] },
        rating: 4.9,
        contact: "+91-22-2640-5000",
        availability: "Mon-Sat: 10AM - 6PM"
    },
    {
        name: "Dr. Meera Desai",
        specialization: "Child Psychologist",
        address: "Hinduja Hospital, Mahim, Mumbai",
        location: { type: "Point", coordinates: [72.8397, 19.0330] },
        rating: 4.6,
        contact: "+91-22-2444-9199",
        availability: "Mon-Fri: 9AM - 5PM"
    },
    {
        name: "Dr. Arjun Mehta",
        specialization: "Clinical Psychologist",
        address: "Breach Candy Hospital, Breach Candy, Mumbai",
        location: { type: "Point", coordinates: [72.8054, 18.9712] },
        rating: 4.8,
        contact: "+91-22-2367-1888",
        availability: "Mon-Sat: 11AM - 7PM"
    },

    // Bangalore
    {
        name: "Dr. Kavita Rao",
        specialization: "Psychiatrist",
        address: "Manipal Hospital, HAL Airport Road, Bangalore",
        location: { type: "Point", coordinates: [77.6648, 12.9577] },
        rating: 4.7,
        contact: "+91-80-2502-4444",
        availability: "Mon-Sat: 9AM - 6PM"
    },
    {
        name: "Dr. Suresh Nair",
        specialization: "Clinical Psychologist",
        address: "Apollo Hospital, Bannerghatta Road, Bangalore",
        location: { type: "Point", coordinates: [77.6033, 12.8996] },
        rating: 4.8,
        contact: "+91-80-2630-0100",
        availability: "Tue-Sun: 10AM - 6PM"
    },
    {
        name: "Dr. Lakshmi Iyer",
        specialization: "Counseling Psychologist",
        address: "Fortis Hospital, Cunningham Road, Bangalore",
        location: { type: "Point", coordinates: [77.5946, 12.9899] },
        rating: 4.9,
        contact: "+91-80-6621-4444",
        availability: "Mon-Fri: 11AM - 7PM"
    },

    // Hyderabad
    {
        name: "Dr. Ramesh Reddy",
        specialization: "Psychiatrist",
        address: "KIMS Hospital, Kondapur, Hyderabad",
        location: { type: "Point", coordinates: [78.3649, 17.4608] },
        rating: 4.6,
        contact: "+91-40-4488-8888",
        availability: "Mon-Sat: 9AM - 5PM"
    },
    {
        name: "Dr. Shalini Gupta",
        specialization: "Clinical Psychologist",
        address: "Apollo Hospital, Jubilee Hills, Hyderabad",
        location: { type: "Point", coordinates: [78.4089, 17.4239] },
        rating: 4.8,
        contact: "+91-40-2360-7777",
        availability: "Mon-Fri: 10AM - 6PM"
    },
    {
        name: "Dr. Anil Kumar",
        specialization: "Child Psychiatrist",
        address: "Care Hospital, Banjara Hills, Hyderabad",
        location: { type: "Point", coordinates: [78.4400, 17.4126] },
        rating: 4.7,
        contact: "+91-40-6165-6565",
        availability: "Tue-Sat: 11AM - 7PM"
    },

    // Chennai
    {
        name: "Dr. Sunita Krishnan",
        specialization: "Psychiatrist",
        address: "Apollo Hospital, Greams Road, Chennai",
        location: { type: "Point", coordinates: [80.2420, 13.0569] },
        rating: 4.9,
        contact: "+91-44-2829-3333",
        availability: "Mon-Sat: 9AM - 6PM"
    },
    {
        name: "Dr. Venkat Raman",
        specialization: "Clinical Psychologist",
        address: "Fortis Malar Hospital, Adyar, Chennai",
        location: { type: "Point", coordinates: [80.2574, 13.0067] },
        rating: 4.7,
        contact: "+91-44-4289-2222",
        availability: "Mon-Fri: 10AM - 5PM"
    },
    {
        name: "Dr. Deepa Menon",
        specialization: "Counseling Psychologist",
        address: "MIOT Hospital, Manapakkam, Chennai",
        location: { type: "Point", coordinates: [80.1629, 13.0199] },
        rating: 4.8,
        contact: "+91-44-4200-2288",
        availability: "Tue-Sun: 11AM - 7PM"
    }
];

async function seedDoctors() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing doctors
        console.log('🗑️  Clearing existing doctors...');
        await Doctor.deleteMany({});
        console.log('✅ Cleared existing doctors');

        // Insert sample doctors
        console.log('📝 Inserting sample doctors...');
        const result = await Doctor.insertMany(sampleDoctors);
        console.log(`✅ Successfully inserted ${result.length} doctors`);

        // Display summary
        console.log('\n📊 Summary by City:');
        const cities = {
            'Delhi': sampleDoctors.filter(d => d.address.includes('Delhi')).length,
            'Mumbai': sampleDoctors.filter(d => d.address.includes('Mumbai')).length,
            'Bangalore': sampleDoctors.filter(d => d.address.includes('Bangalore')).length,
            'Hyderabad': sampleDoctors.filter(d => d.address.includes('Hyderabad')).length,
            'Chennai': sampleDoctors.filter(d => d.address.includes('Chennai')).length
        };

        Object.entries(cities).forEach(([city, count]) => {
            console.log(`  ${city}: ${count} specialists`);
        });

        console.log('\n✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDoctors();
