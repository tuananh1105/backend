const express = require("express");
const { upload } = require("../config/multer");

const {
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
  createOrder,
  getOrdersByUserId,
  cancelOrder,
  confirmReceived,
  setDelivered,
  updateReturnReason,
  returnOrder,
  countSuccessfulOrders,
  getOrderByIdAdmin,
  getOrdersByUserIdWithOnlinePayment,
  getSoldQuantityByProductId,
  uploadComplaint,
  getOrdersByStatus,
  getOrdersByStatusUserId,
  getOrderAll,
} = require("../controllers/order");
const router = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     tags:
 *      - Orders  
 *     summary: Thêm đơn hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/orders", createOrder);
/**
 * @swagger
 * /order-all:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy danh sách đơn hàng
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/order-all", getOrderAll);
/**
 * @swagger
 * /orders/by-status:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy danh sách đơn hàng theo trạng thái
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/orders/by-status", getOrdersByStatus);
/**
 * @swagger
 * /orders/by-status-user/:userId:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy danh sách đơn hàng theo trạng thái của người dùng
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/orders/by-status-user/:userId", getOrdersByStatusUserId);
router.get("/orders", getOrders);
/**
 * @swagger
 * /orders/:orderId/admin:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy đơn hàng theo id admin
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/orders/:orderId/admin", getOrderByIdAdmin);
/**
 * @swagger
 * /orders/:userId/:orderId:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy đơn hàng theo id user
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/orders/:userId/:orderId", getOrderById);
/**
 * @swagger
 * /orders/:userId:
 *   get:
 *     tags:
 *      - Orders  
 *     summary: Lấy danh sách đơn hàng user
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/orders/:userId", getOrdersByUserId);
/**
 * @swagger
 * /orders/:orderId:
 *   put:
 *     tags:
 *      - Orders  
 *     summary: sửa đơn hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put("/orders/:orderId", updateOrder);
/**
 * @swagger
 * /orders/:userId/:orderId:
 *   delete:
 *     tags:
 *      - Orders  
 *     summary: xoá đơn hàng theo userId
 *     responses:
 *       201:
 *         description: Thành công
 */
router.delete("/orders/:userId/:orderId", deleteOrder);
/**
 * @swagger
 * /orders/:orderId/cancel:
 *   put:
 *     tags:
 *      - Orders  
 *     summary: huỷ đơn hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put("/orders/:orderId/cancel", cancelOrder);
router.put("/orders/:orderId/confirm-received", confirmReceived);
router.put("/orders/:orderId/set-delivered", setDelivered);
router.put("/orders/:orderId/return", returnOrder);
router.post("/:id/return", updateReturnReason);
router.get("/count-successful-orders", countSuccessfulOrders);
router.get('/order/:userId', getOrdersByUserIdWithOnlinePayment);
router.get('/order/sold/:productId', getSoldQuantityByProductId);

router.post(
  `/upload-gallery-complaint`,
  upload.array("complaint", 10),
  uploadComplaint
);

module.exports = router;
