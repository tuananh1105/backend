const Mail = require("../helpers/node-mailler");
const Order = require("../models/order");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const axios = require("axios");
require("dotenv").config();
const { config, order2 } = require("../zalo_pay/config");
const cron = require('node-cron');
const Coupon = require("../models/coupon");
const User = require("../models/user");
const { ObjectId } = require('mongodb');


const ZALOPAY_ID_APP = process.env.ZALOPAY_ID_APP;
const ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1;
const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT;

const createOrder = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId, items, totalPrice, customerInfo, paymentMethod, shippingMessageDisplay , discount, couponCode } = req.body;

      const order = await Order.create({
        userId,
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug || `product-${item.productId}`,  
          name: item.name,
          priceAtTime: item.priceAtTime,
          quantity: item.quantity,
          image: item.image,
          color: item.variant?.color || item.color,
          size: item.variant?.size || item.size,
          weight: item.variant?.weight || item.weight,
          countInStock: item.variant?.countInStock || item.countInStock,
        })),
        totalPrice,
        customerInfo,
        paymentMethod,
        status: "pending", 
        paymentStatus: "cod", 
        shippingMessageDisplay,
        discount,
      });


      for (const item of items) {
        const product = await Product.findById(item.productId);
        const variant = product.variants.find(
          (variant) => variant.sku === item.variantId
        );
      
        if (variant) {
          const product = await Product.findOne(
            { _id: item.productId, "variants.sku": item.variantId },
            { "variants.$": 1 }
          );
        
          const currentStock = product?.variants[0]?.countInStock || 0;
        
          if (currentStock >= item.quantity) {
            await Product.updateOne(
              { _id: item.productId, "variants.sku": item.variantId },
              { $inc: { "variants.$.countInStock": -item.quantity } }
            );
          } else {
            // Báo lỗi sang FE
            throw new Error(`Sản phẩm với SKU ${item.variantId} chỉ còn ${currentStock} sản phẩm trong kho.`);
          }
        }
        
      }
        const Id = new ObjectId(order.userId); // Chuyển sang ObjectId
        const user = await User.findOne({ _id: Id });

      // if (!user || !user.email) {
      //   throw new Error('User not found or email is missing.');
      // }
      // const email = user.email;
      // Mail.sendOrderConfirmation(email, order);

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon) {
          return res.status(400).json({ error: "Invalid coupon code" });
        }
      
        if (!coupon.isActive || coupon.expirationDate < new Date()) {
          return res.status(400).json({ error: "Coupon has expired or is inactive" });
        }
      
        coupon.usageCount += 1;
        coupon.usedBy.push(userId);
        await coupon.save();
      }          

      if (paymentMethod === "cod") {
        return res.status(200).json({ 
          message: "Order created successfully", 
          orderId: order._id ,          
        });
      }
      if (paymentMethod === "online") {
        const transID = Math.floor(Math.random() * 1000000);
        const payment = {
          app_id: ZALOPAY_ID_APP,
          app_trans_id: `${moment().format("YYMMDD")}_${order._id}`,
          app_user: order._id,
          app_time: Date.now(),
          item: JSON.stringify(items),
          embed_data: JSON.stringify({
            redirecturl: "http://localhost:5173/thanks",
          }),
          amount: +totalPrice,
          description: `Pay for OrderId #${transID}`,
          bank_code: "",
          callback_url: "https://b153-42-114-151-28.ngrok-free.app/api/callback",
        };

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

        try {
          const { data } = await axios.post(ZALOPAY_ENDPOINT, null, {
            params: payment,
          });
          if (!data?.order_url) {
            throw new Error("Error when payment");
          }

          order.transactionid = payment.app_trans_id;
          await order.save();
          return res.status(200).json(data.order_url);
        } catch (error) {
          console.error("Error creating ZaloPay order:", error.message);
          throw new Error("Failed to initiate payment");
        }
      }
      return res.end();
    } catch (error) {
      console.error("Error creating order:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });
};


const countOrdersByStatus = async () => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const orderCounts = {};
  orders.forEach((order) => {
    orderCounts[order._id] = order.count;
  });

  return orderCounts;
};

const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 1000,
      status,
      sortBy = "createdAt",
      order = "desc",
      range, // week | month | year
    } = req.query;

    const validStatuses = [/* ... giữ nguyên danh sách status như trước */];

    const filter = {};

    // Filter theo status
    if (status) {
      const statusArray = status.split(",").map(s => s.trim()).filter(s => validStatuses.includes(s));
      if (statusArray.length > 0) {
        if (statusArray.includes("all-delivery")) {
          filter.status = {
            $in: ["pending", "pendingPayment", "shipped", "delivered", "received", "canceled"],
          };
        } else if (statusArray.includes("all-complaint")) {
          filter.status = {
            $in: ["complaint", "refund_in_progress", "exchange_in_progress", "refund_completed", "exchange_completed", "canceled_complaint"],
          };
        } else if (statusArray.includes("all-refund")) {
          filter.status = { $in: ["refund_initiated", "refund_done"] };
          filter.paymentMethod = "online";
        } else {
          filter.status = { $in: statusArray };
        }
      }
    }

    // Filter theo range (tuần, tháng, năm)
    if (range) {
      const now = new Date();
      let fromDate;

      if (range === "week") {
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
      } else if (range === "month") {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (range === "year") {
        fromDate = new Date(now.getFullYear(), 0, 1);
      }

      if (fromDate) {
        filter.createdAt = { $gte: fromDate };
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments(filter);

    const orderCounts = await countOrdersByStatus();

    const totalDeliveredValue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalDeliveredAmount = totalDeliveredValue.length > 0 ? totalDeliveredValue[0].total : 0;

    return res.status(StatusCodes.OK).json({
      data: orders,
      meta: {
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
      statusCounts: orderCounts,
      totalDeliveredAmount,
    });
  } catch (error) {
    console.error("Error in getOrders:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};



const getOrderById = async (req, res) => {
  try {
    const { userId, orderId } = req.params; // Lấy userId và orderId từ params

    // Tìm đơn hàng dựa trên orderId và userId
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Order not found or does not belong to the user" });
    }

    return res.status(StatusCodes.OK).json({ data: order });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};



const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) 

    if (!orders || orders.length === 0) {
      return res.status(StatusCodes.OK).json([]); 
    }

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.color || !item.size) {
          console.warn(`Order item missing color or size: ${item.name}`);
        }
      });
    });

    return res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    let { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      console.warn(`Order with id ${orderId} not found.`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Order not found" });
    }

    // Kiểm tra vai trò của người dùng
    const Id = new ObjectId(order.userId);
    const user = await User.findOne({ _id: Id });

    // if (!user || !user.email) {
    //   throw new Error('User not found or email is missing.');
    // }

    // Nếu người dùng là admin, không cho phép cập nhật trạng thái 'delivered'
    // if (user.role === 'admin' && status === 'delivered') {
    //   return res.status(StatusCodes.FORBIDDEN).json({ error: "Admins cannot update the status to 'delivered'" });
    // }

    // Logic xử lý các trạng thái khác của đơn hàng
    if ((status === "refund_completed" && order.status !== "refund_completed") || 
        (status === "canceled" && order.status !== "canceled")) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (product) {
          const variantIndex = product.variants.findIndex(
            (v) => v.color === item.color && v.size === item.size
          );

          if (variantIndex >= 0) {
            product.variants[variantIndex].countInStock += item.quantity;
          } else {
            product.countInStock += item.quantity;
          }

          await product.save();
        }
      } 
    }

    if (status === "delivered" && order.status !== "delivered") {
      order.paymentStatus = "pending";
    }
    if (status === "refund_done" && order.status !== "refund_done") {
      order.paymentStatus = "doneRefund";
    }
    if (status === "canceled" && order.status !== "canceled") {
      if(order.paymentMethod === 'online'){
        order.paymentStatus = "pendingRefund";
        status = 'refund_initiated';
      }
    }
    if (order.status !== status) {
      order.statusHistory.push(order.status);
      order.status = status;
      await order.save();
    }

    // Gửi email (đã chú thích)
    // const email = user.email;
    // if (email) {
    //   await Mail.sendOrderStatusUpdate(email, order);
    // } else {
    //   console.warn("Customer email not found. Skipping email notification.");
    // }

    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};


const deleteOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Order not found" });
    }
    if (!order.status === "pending") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Order delete successfully" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body; // Nhận lý do huỷ nếu có

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json({ message: "Thiếu hoặc sai định dạng orderId" });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Chỉ cho huỷ nếu đang chờ xác nhận
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Đơn hàng đã được xác nhận hoặc đang xử lý, không thể hủy",
      });
    }

    // Trả hàng về kho
    for (const item of order.items) {
      const product = await Product.findById(item.productId);

      if (product) {
        const variantIndex = product.variants.findIndex(
          (v) => v.color === item.color && v.size === item.size
        );

        if (variantIndex >= 0) {
          product.variants[variantIndex].countInStock += item.quantity;
        }

        // Nếu không tìm thấy variant thì cộng vào tổng (trường hợp thiếu cấu trúc)
        product.countInStock += item.quantity;

        await product.save();
      }
    }

    // Cập nhật trạng thái đơn hàng
    if (order.paymentMethod === "cod") {
      order.status = "canceled";
    } else if (order.paymentMethod === "online") {
      order.status = "refund_initiated";
      order.paymentStatus = "pendingRefund";
    }

    // Ghi lại lý do huỷ nếu có
    if (reason) {
      order.cancelReason = reason;
    }

    await order.save();

    // Gửi email nếu có
    if (order.customerInfo?.email) {
      await Mail.sendOrderStatusUpdate(order.customerInfo.email, order);
    }

    res.status(200).json({
      message: "Đơn hàng đã được hủy thành công",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error.message);
    res.status(500).json({
      message: "Có lỗi xảy ra khi hủy đơn hàng",
      error: error.message || error,
    });
  }
};


const confirmReceived = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow update if the status is 'received'
    if (order.status !== "received") {
      return res.status(400).json({
        message: "Only received orders can be confirmed as delivered",
      });
    }

    order.status = "delivered"; 
    order.paymentStatus = 'pending'
    await order.save();

    if (order.customerInfo && order.customerInfo.email) {
      console.log(`Sending status update email to ${order.customerInfo.email}`);
      await Mail.sendOrderStatusUpdate(order.customerInfo.email, order);
    } else {
      console.warn("Customer email not found. Skipping email notification.");
    }

    res.json({ message: "Order status updated to delivered" });
  } catch (error) {
    res.status(500).json({ message: "Error confirming order received" });
  }
};

const setDelivered = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Nếu trạng thái là "received" và chưa có `receivedAt`, thiết lập thời gian hiện tại
    if (order.status === "received" && !order.receivedAt) {
      order.receivedAt = new Date();
      console.log(
        `Đặt receivedAt cho đơn hàng ${order._id} là ${order.receivedAt}`
      );
    }

    // Cập nhật trạng thái thành "delivered" ngay khi người dùng xác nhận
    order.status = "delivered";
    await order.save();

    res.status(200).json({
      message: "Order status updated to delivered",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order to delivered", error });
  }
};
const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason, returnType: type, images } = req.body;// Thêm images vào body

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (type === "complaint") {
      if (order.status !== "delivered" && order.status !== "received") {
        return res.status(400).json({
          message: "Chỉ có thể khiếu nại đơn hàng đã giao hoặc đã nhận",
        });
      }

      order.status = "complaint";
      order.returnReason = reason;
      if (images && Array.isArray(images)) {
        order.complaintImages = images; // Gán danh sách ảnh khiếu nại
      }

    } else if (type === "canceled") {
      if (order.status !== "pending" && order.status !== "confirmed") {
        return res.status(400).json({
          message: "Chỉ có thể huỷ đơn hàng khi đang chờ xác nhận hoặc đã xác nhận",
        });
      }

      order.status = "canceled";
      order.cancelReason = reason;
      if (images && Array.isArray(images)) {
        order.cancelImages = images; // Gán danh sách ảnh huỷ đơn (nếu cần)
      }

    } else {
      return res.status(400).json({ message: "Loại hành động không hợp lệ" });
    }

    await order.save();

    res.status(200).json({
      message:
        type === "complaint"
          ? "Đơn hàng đã được xử lý khiếu nại thành công"
          : "Đơn hàng đã được huỷ thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi xử lý yêu cầu",
      error,
    });
  }
};



const updateReturnReason = async (req, res) => {
  const { id } = req.params;
  const { returnReason, status } = req.body;

  // Kiểm tra định dạng id
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Thiếu hoặc sai định dạng id" });
  }

  try {
    const order = await Order.findById(id);

    // Kiểm tra nếu đơn hàng không tồn tại
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Kiểm tra lý do trả hàng
    if (!returnReason) {
      return res.status(400).json({ message: "Return reason is required." });
    }

    // Kiểm tra trạng thái có hợp lệ không
    if (!["complaint", "return_completed", "pendingPayment", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status for return." });
    }

    // Nếu trạng thái chuyển thành "canceled" và trước đó không phải "canceled"
   
    // Cập nhật trạng thái và lý do trả hàng
    order.returnReason = returnReason;
    order.status = status;

    // Thêm trạng thái mới vào lịch sử trạng thái
    order.statusHistory.push({ status, time: new Date() });

    await order.save();

    // Gửi email thông báo nếu cần
    if (order.customerInfo && order.customerInfo.email) {
      await Mail.sendOrderStatusUpdate(order.customerInfo.email, order);
    }
   
    
    res.status(200).json({
      message: "Order updated with return reason and status.",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error.message);
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
      error: error.message || error,
    });
  }
};

cron.schedule('* * * * *', async () => {
  try {
    console.log("Cron job triggered at:", new Date());

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);

    // Tìm các đơn hàng có trạng thái 'pendingPayment' quá 1 phút
    const orders = await Order.find({
      status: 'pendingPayment',
      updatedAt: { $lt: oneMinuteAgo },
    });

    console.log("Orders to update:", orders.length);

    for (const order of orders) {
      console.log(`Processing order: ${order._id}`);

      // Tăng số lượng tồn kho cho các sản phẩm trong đơn hàng
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (product) {
          const variantIndex = product.variants.findIndex(
            (v) => v.color === item.color && v.size === item.size
          );

          if (variantIndex >= 0) {
            product.variants[variantIndex].countInStock += item.quantity;
            console.log(
              `Updated variant stock for product ${product._id}:`,
              product.variants[variantIndex]
            );
          } else {
            product.countInStock += item.quantity;
            console.log(
              `Updated main product stock for product ${product._id}:`,
              product.countInStock
            );
          }

          await product.save();
        } else {
          console.log(`Product not found for item: ${item.productId}`);
        }
      }

      order.status = 'canceled';
      order.statusHistory.push(JSON.stringify({ status: 'canceled', time: new Date() }));
      await order.save();

      console.log(`Order ${order._id} status updated to canceled.`);
    }
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});

const countSuccessfulOrders = async (req, res) => {
  try {
    const successfulOrdersCount = await Order.countDocuments({
      status: "delivered",
    });

    const totalDeliveredAmountResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } },
    ]);

    const totalDeliveredAmount =
      totalDeliveredAmountResult[0]?.totalAmount || 0;

    return res.status(StatusCodes.OK).json({
      message: "Số lượng và tổng tiền của đơn hàng thành công",
      successfulOrders: successfulOrdersCount,
      totalDeliveredAmount,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
const getOrderByIdAdmin = async (req, res) => {
  try {
    const {  orderId } = req.params;
    const order = await Order.findOne({  _id: orderId });
    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Order not found" });
    }
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getOrdersByUserIdWithOnlinePayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;  
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments({ userId, paymentMethod: "online" }); 

    const orders = await Order.find({ userId, paymentMethod: "online" })
      .sort({ createdAt: -1 })
      .skip(skip) 
      .limit(Number(limit)); 
    if (!orders || orders.length === 0) {
      return res.status(StatusCodes.OK).json({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 } });
    }

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.color || !item.size) {
          console.warn(`Order item missing color or size: ${item.name}`);
        }
      });
    });

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(StatusCodes.OK).json({
      data: orders,
      meta: {
        totalItems: totalOrders,
        totalPages: totalPages,
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getSoldQuantityByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("Received productId:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId format" });
    }

    const objectId = new mongoose.Types.ObjectId(productId);

    // Tìm tất cả đơn hàng có trạng thái 'delivered' chứa sản phẩm cần tìm
    const orders = await Order.find({
      status: "delivered",
      "items.productId": objectId, // Lọc theo productId trong items
    });

    console.log("Found Delivered Orders:", orders.length);

    let soldQuantity = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId.equals(objectId)) {
          soldQuantity += item.quantity;
        }
      });
    });

    console.log("Total Sold Quantity:", soldQuantity);

    return res.status(200).json({ productId, soldQuantity });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};


const uploadComplaint = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      uploadedFiles.push(file.path);
    }

    res.json(uploadedFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" + error });
  }
};

const getOrdersByStatus = async (req, res) => {
  try {
    let {
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    // Nếu không truyền status hoặc status là ALL => không lọc theo trạng thái
    let filter = {};
    if (status && status !== "ALL") {
      const statusArray = status.split(",").map(s => s.trim());
      filter.status = { $in: statusArray };
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const totalItems = await Order.countDocuments(filter);

    return res.status(200).json({
      data: orders,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error in getOrdersByStatus:", error);
    return res.status(500).json({ error: error.message });
  }
};


const getOrdersByStatusUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId." });
    }

    const filter = { userId }; // ✅ Bổ sung lọc theo userId

    if (status && status !== "ALL") {
      const statusArray = status.split(",").map((s) => s.trim());
      filter.status = { $in: statusArray };
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const totalItems = await Order.countDocuments(filter);

    return res.status(200).json({
      data: orders,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error in getOrdersByStatusUserId:", error);
    return res.status(500).json({ error: error.message });
  }
};


const getOrderAll = async (req, res) => {
  try {
    const { status } = req.query;

    const validStatuses = [
      "pending",
      "pendingPayment",
      "confirmed",
      "shipped",
      "received",
      "delivered",
      "canceled",
      "complaint",
      "refund_in_progress",
      "exchange_in_progress",
      "refund_completed",
      "exchange_completed",
      "canceled_complaint",
      "refund_initiated",
      "refund_done",
    ];

    const filter = {};

    if (status) {
      const statusArray = status
        .split(",")
        .map((s) => s.trim())
        .filter((s) => validStatuses.includes(s));

      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
      }
    }

    const orders = await Order.find(filter);

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng theo trạng thái:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getOrderById,
  confirmReceived,
  getOrders,
  updateOrder,
  deleteOrder,
  createOrder,
  getOrdersByUserId,
  cancelOrder,
  setDelivered,
  returnOrder,
  updateReturnReason,
  countSuccessfulOrders,
  getOrderByIdAdmin,
  getOrdersByUserIdWithOnlinePayment,
  getSoldQuantityByProductId,
  uploadComplaint,
  getOrdersByStatus,
  getOrdersByStatusUserId,
  getOrderAll,
};
