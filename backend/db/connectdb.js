const mongoose = require('mongoose');

// Update connectdb.js to modern syntax:
const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Connection error:", error);
    }
};

mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
});

module.exports = connectdb;
