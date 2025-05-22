const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000, // Tăng thời gian chờ chọn máy chủ lên 20 giây
      connectTimeoutMS: 30000, // Tăng thời gian chờ kết nối lên 30 giây
      socketTimeoutMS: 45000, // Tăng thời gian chờ socket lên 45 giây
      maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err; // Ném lỗi để xử lý ở nơi gọi
  }
};

module.exports = { connectDB };