const express = require("express");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
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

dotenv.config();
const { connectDB } = require("./config/db");

const app = express();

// Cấu hình Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${process.env.APP_PORT || 5000}/api` },
      { url: "https://backend-0xpp.onrender.com/api" }
    ],
  },
  apis: ['./src/routers/*.js'], // Đường dẫn đúng tới folder routers
};
const swaggerSpec = swaggerJsdoc(options);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get("/", (req, res) => {
  res.send("✅ API is live!");
});

// Các route API
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

// Tạo server HTTP và Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://project-nextjs-qos7.vercel.app",
    credentials: true,
  },
});

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

// Kết nối MongoDB rồi mới khởi động server
const PORT = process.env.APP_PORT || 5000;

connectDB(process.env.DB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server and Socket.IO running on port ${PORT}`);
      console.log(`🌐 Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
