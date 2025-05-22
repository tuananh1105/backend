// config/db.js
const mongoose = require("mongoose");

const connectDB = async (uri) => {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000, // Hoặc cao hơn nếu cần
  });
};

module.exports = { connectDB };
