const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Import routes
const cartRouter = require("./routers/cart");
const productRouter = require("./routers/product");
const categoryRouter = require("./routers/category");
const authRouter = require("./routers/auth.router");
const orderRouter = require("./routers/order");
const shippingRoutes = require("./routers/shipping");
const couponRoutes = require("./routers/coupon");
const commentRouter = require("./routers/comment");
const paymentRoutes = require("./routers/paymentRoutes");
const blogRoutes = require("./routers/blog");
const customerRoutes = require("./routers/customerRoutes");
const colorRoutes = require("./routers/color");
const sizeRoutes = require("./routers/size");

// Database connection
const { connectDB } = require("./config/db");

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // hoặc domain frontend thực tế khi deploy
    credentials: true,
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/", (req, res) => {
  res.send("✅ API is live!");
});

// Routes
app.use("/api", productRouter);
app.use("/api", authRouter);
app.use("/api", categoryRouter);
app.use("/api", cartRouter);
app.use("/api", orderRouter);
app.use("/api", shippingRoutes);
app.use("/api", couponRoutes);
app.use("/api", commentRouter);
app.use("/api", paymentRoutes);
app.use("/api", blogRoutes);
app.use("/api", customerRoutes);
app.use("/api", colorRoutes);
app.use("/api", sizeRoutes);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 A client connected:", socket.id);

  socket.on("admin-update-product", (data) => {
    io.emit("update-cart", data);
  });

  socket.on("checkout-update-quantity", (data) => {
    console.log("Checkout quantity updated:", data);
    io.emit("notify-quantity-change", data);
  });

  socket.on("admin-send-message", (data) => {
    console.log("Admin sent a message:", data);
    io.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Start server only after DB is connected
const PORT = process.env.PORT || process.env.APP_PORT || 5000;

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000, // Tăng thời gian chờ lên 20 giây
      maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
      connectTimeoutMS: 30000, // Thời gian chờ kết nối tối đa (30 giây)
      socketTimeoutMS: 45000, // Thời gian chờ cho mỗi hoạt động socket (45 giây)
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err; // Ném lỗi để xử lý ở nơi gọi hàm
  }
};
module.exports = connectDB;
