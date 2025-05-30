// routers/comment.js
const express = require("express");
const { addComment, getCommentsByProduct, deleteComment, deleteCommentByAdmin, checkReviewedProducts, getCommentsByProducts } = require("../controllers/comment");
const authMiddleware = require("../middleware/authComment");
const router = express.Router();

// Thêm bình luận mới
/**
 * @swagger
 * /comments:
 *   post:
 *     tags:
 *      - Comments  
 *     summary: Thêm bình luận
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post("/comments", addComment);

/**
 * @swagger
 * /comments/product/:productId:
 *   get:
 *     tags:
 *      - Comments  
 *     summary: Lấy danh sách bình luận theo productId
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/comments/product/:productId", getCommentsByProduct);
/**
 * @swagger
 * /comments/products:
 *   get:
 *     tags:
 *      - Comments  
 *     summary: Lấy danh sách bình luận
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/comments/products', getCommentsByProducts);


/**
 * @swagger
 * /comments/:commentId:
 *   delete:
 *     tags:
 *      - Comments  
 *     summary: Xoá bình luận
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/comments/:commentId', authMiddleware, deleteComment);
/**
 * @swagger
 * /comments/:commentId/admin:
 *   delete:
 *     tags:
 *      - Comments  
 *     summary: Xoá bình luận admin
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/comments/:commentId/admin', deleteCommentByAdmin);
router.post('/comments/check-reviewed', checkReviewedProducts);

module.exports = router;
