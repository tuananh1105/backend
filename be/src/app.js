// app.js
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();

const app = express();
const server = http.createServer(app);
const { connectDB } = require("./config/db");

// Routers
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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("✅ API is live!");
});

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

io.on("connection", (socket) => {
  console.log("🔌 A client connected:", socket.id);

  socket.on("admin-update-product", (data) => {
    io.emit("update-cart", data);
  });

  socket.on("checkout-update-quantity", (data) => {
    io.emit("notify-quantity-change", data);
  });

  socket.on("admin-send-message", (data) => {
    io.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || process.env.APP_PORT || 5000;

connectDB(process.env.DB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server and Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB. Server not started.");
  });
