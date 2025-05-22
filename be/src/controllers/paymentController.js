const axios = require("axios");
const CryptoJS = require("crypto-js");
const { config, order2  } = require("../zalo_pay/config");
const Order = require("../models/order");
const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();


const callback = async (req, res) => {
  const { data, mac } = req.body;

  const appKey = process.env.ZALOPAY_KEY2; 
  const dataJson = JSON.parse(data); 
  const transactionId = dataJson.app_trans_id;
  const orderId = dataJson.app_user;

  try {
    // Xác minh tính hợp lệ của MAC
    const macVerify = CryptoJS.HmacSHA256(data, appKey).toString();
    if (mac !== macVerify) {
      return res.json({ return_code: -1, return_message: "Invalid MAC" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ return_code: -1, return_message: "Order not found" });
    }

    // Xử lý trạng thái phản hồi từ ZaloPay
    if (dataJson.return_code === 1) {
      // Thanh toán thành công
      order.paymentStatus = "paid";
      order.status = "Chờ xác nhận";
    } else {
      // Thanh toán thất bại hoặc bị hủy
      order.paymentStatus = "fail";
      order.status = "Chờ thanh toán";
    }

    await order.save();

    return res.json({ return_code: 1, return_message: "Success" });
  } catch (error) {
    console.error("Error in callback:", error.message);
    return res.json({ return_code: 0, return_message: "Internal server error" });
  }
};

const updatePaymentStatusOnFailure = async (req, res) => {
  let { orderId, paymentStatus } = req.body;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid or missing Order ID" });
  }   

  orderId = new mongoose.Types.ObjectId(orderId);
  console.log("oderId", orderId);
  if (!["paid", "pending", "failed", "pendingPayment"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid paymentStatus value" });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === "pending") {
      order.status = "pending";
      order.paymentStatus = "pending";
      await order.save();
    } else if (paymentStatus === "failed") {
      order.status = "pendingPayment";
    }

    await order.save();

    return res.status(200).json({
      message: `Order ${orderId} updated successfully`,
      order,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const retryPayment = async (req, res) => {
  const { orderId } = req.body;
  const ZALOPAY_ID_APP = process.env.ZALOPAY_ID_APP;
  const ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1;
  try {
    console.log("Received orderId:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod !== "online") {
      return res.status(400).json({ message: "Payment method is not online" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const generateRandomChar = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return chars.charAt(Math.floor(Math.random() * chars.length));
    };


    const transID = Math.floor(Math.random() * 10000000);
    const payment = {
      app_id: ZALOPAY_ID_APP,
      app_trans_id: `${moment().format("YYMMDD")}_${order._id}${generateRandomChar()}`, 
      app_user: order._id,
      app_time: Date.now(),
      item: JSON.stringify(order.items),
      embed_data: JSON.stringify({
        redirecturl: "http://localhost:5173/thanks",
      }),
      amount: +order.totalPrice,
      description: `Pay for OrderId #${transID}`,
      bank_code: "",
      callback_url: "https://b153-42-114-151-28.ngrok-free.app/api/callback",
    };
    console.log("payment", payment);

    const dataEncode =
      ZALOPAY_ID_APP +
      "|" +
      payment.app_trans_id +
      "|" +
      payment.app_user +
      "|" +
      payment.amount +
      "|" +
      payment.app_time +
      "|" +
      payment.embed_data +
      "|" +
      payment.item;
    payment.mac = CryptoJS.HmacSHA256(dataEncode, ZALOPAY_KEY1).toString();

    console.log("Payment payload:", payment);

    const { data } = await axios.post(process.env.ZALOPAY_ENDPOINT, null, {
      params: payment,
    });

    console.log("ZaloPay response:", data);

    if (data.return_code !== 1) {
      throw new Error(data.return_message || "Error when retrying payment");
    }

    order.paymentStatus = "pending";
    order.status = "pending";
    await order.save();

    return res.status(200).json({ paymentUrl: data.order_url });
  } catch (error) {
    console.error("Error in retryPayment:", error.message);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};


module.exports = {
  updatePaymentStatusOnFailure,
  callback,
  retryPayment
};
