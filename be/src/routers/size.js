const express = require("express");
const {
    getSizes,
    addSize,
    deleteSize,
    getSizeById,
    editSize,
  } = require("../controllers/size");

const router = express.Router();
/**
 * @swagger
 * /sizes:
 *   get:
 *     tags:
 *      - Sizes  
 *     summary: Láy danh sách size
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/sizes`, getSizes);
/**
 * @swagger
 * /sizes:
 *   post:
 *     tags:
 *      - Sizes  
 *     summary: Thêm size
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/sizes`, addSize);
/**
 * @swagger
 * /sizes/:id:
 *   delete:
 *     tags:
 *      - Sizes  
 *     summary: Xoá size
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete(`/sizes/:id`, deleteSize);
/**
 * @swagger
 * /size/:id:
 *   get:
 *     tags:
 *      - Sizes  
 *     summary: Láy size theo id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/size/:id`, getSizeById);
/**
 * @swagger
 * /sizes/:id:
 *   get:
 *     tags:
 *      - Sizes  
 *     summary: Cập nhật size
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put(`/sizes/:id`, editSize);

module.exports = router;
