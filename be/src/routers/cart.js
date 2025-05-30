const express = require("express");
const {
  addItemToCart,
  decreaseProductQuantity,
  deleteItemFromCart,
  getCartByUserId,
  increaseProductQuantity,
  updateProductQuantity,
  getProductInCartByVariantId,
  updateItemInCart,
} = require("../controllers/cart");
const router = express.Router();

/**
 * @swagger
 * /cart/add-to-cart:
 *   post:
 *     tags:
 *      - Carts  
 *     summary: Thêm giỏ hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/cart/add-to-cart", addItemToCart);
/**
 * @swagger
 * /cart/:userId:
 *   get:
 *     tags:
 *      - Carts  
 *     summary: Lấy danh sách giỏ hàng theo userId
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/cart/:userId", getCartByUserId);
/**
 * @swagger
 * /cart/increase-quantity:
 *   patch:
 *     tags:
 *      - Carts  
 *     summary: Tăng số lượng giỏ hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.patch("/cart/increase-quantity", increaseProductQuantity);
/**
 * @swagger
 * /cart/decrease-quantity:
 *   patch:
 *     tags:
 *      - Carts  
 *     summary: Giảm số lượng giỏ hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.patch("/cart/decrease-quantity", decreaseProductQuantity);
/**
 * @swagger
 * /cart/update-quantity":
 *   patch:
 *     tags:
 *      - Carts  
 *     summary: Cập nhật số lượng giỏ hàng
 *     responses:
 *       201:
 *         description: Thành công
 */
router.patch("/cart/update-quantity", updateProductQuantity);
/**
 * @swagger
 * /cart/:userId/product:
 *   delete:
 *     tags:
 *      - Carts  
 *     summary: Xoá sản phẩm trong giỏ hàng theo userId
 *     responses:
 *       201:
 *         description: Thành công
 */
router.delete("/cart/:userId/product", deleteItemFromCart);
/**
 * @swagger
 * /cart/:userId/product/:variantId:
 *   get:
 *     tags:
 *      - Carts  
 *     summary: Lấy giỏ hàng theo userId và varaintId
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/cart/:userId/product/:variantId", getProductInCartByVariantId);
/**
 * @swagger
 * /cart/update:
 *   put:
 *     tags:
 *      - Carts  
 *     summary: Update giỏ hàng
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put("/cart/update", updateItemInCart);


module.exports = router;
   