const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  getAvailableCoupons,
  getCouponById,
  getCouponUsers
} = require("../controllers/coupon");

/**
 * @swagger
 * /create-coupon:
 *   post:
 *     tags:
 *      - Coupon  
 *     summary: Thêm mã giảm giá
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/create-coupon", createCoupon);

/**
 * @swagger
 * /get-coupon:
 *   get:
 *     tags:
 *      - Coupon  
 *     summary: Lấy danh sách mã giảm giá
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/get-coupon", getCoupons);
/**
 * @swagger
 * /get-coupon/:couponId:
 *   get:
 *     tags:
 *      - Coupon  
 *     summary: Lấy danh sách mã giảm giá theo Id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/get-coupon/:couponId", getCouponById);
/**
 * @swagger
 * /update-coupon/:couponId:
 *   put:
 *     tags:
 *      - Coupon  
 *     summary: Cập nhật mã giảm giá
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put("/update-coupon/:couponId", updateCoupon);

/**
 * @swagger
 * /delete-coupon/:couponId:
 *   delete:
 *     tags:
 *      - Coupon  
 *     summary: Xoá mã giảm giá
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete("/delete-coupon/:couponId", deleteCoupon);
/**
 * @swagger
 * /apply-coupon:
 *   post:
 *     tags:
 *      - Coupon  
 *     summary: Áp mã giảm giá phía người dùng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/apply-coupon", applyCoupon);

/**
 * @swagger
 * /available-coupon:
 *   get:
 *     tags:
 *      - Coupon  
 *     summary: Lấy danh sách mã giảm giá phía người dùng
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/available-coupon", getAvailableCoupons);
/**
 * @swagger
 * /coupon/:couponId/users:
 *   get:
 *     tags:
 *      - Coupon  
 *     summary: Lấy mã giảm giá theo Id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/coupon/:couponId/users", getCouponUsers);

module.exports = router;
