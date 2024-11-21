const mongoose = require('mongoose');
const TripPreset = require('./models/TripPreset'); // Path to your TripPreset model
const Company = require('./models/Company'); // Path to your Company model

async function populatePresetsWithRandomCompany() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect('mongodb+srv://Cadioyves:Cadio@cavgotest.9yini.mongodb.net/?retryWrites=true&w=majority&appName=cavgotest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the database.');

    // Fetch all companies
    const companies = await Company.find({});
    if (companies.length === 0) {
      console.error('No companies found in the database.');
      return;
    }
    console.log(`Found ${companies.length} companies.`);

    // Find all TripPresets without a company assigned
    const presetsWithoutCompany = await TripPreset.find({ company: null });
    console.log(`Found ${presetsWithoutCompany.length} presets without a company.`);

    // Assign a random company to each preset
    const updatePromises = presetsWithoutCompany.map((preset) => {
      const randomCompany = companies[Math.floor(Math.random() * companies.length)]; // Pick a random company
      preset.company = randomCompany._id; // Assign the random company's ID
      return preset.save(); // Save the updated preset
    });

    await Promise.all(updatePromises);

    console.log('All presets have been updated with random companies.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    mongoose.connection.close(); // Close the database connection
    console.log('Database connection closed.');
  }
}

// Run the script
populatePresetsWithRandomCompany();
