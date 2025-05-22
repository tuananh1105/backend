const mongoose = require("mongoose");
const connectDB = async (uri) => {
  try {
    console.log("👉 MongoDB URI:", uri); // Debug
    await mongoose.connect(uri);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectDB,
};
