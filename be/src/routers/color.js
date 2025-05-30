const express = require("express");
const {
    getColors,
    addColor,
    deleteColor,
    editColor,
    getColorById,
  } = require("../controllers/color");

const router = express.Router();

/**
 * @swagger
 * /colors:
 *   get:
 *     tags:
 *      - Colors  
 *     summary: Lấy danh sách màu
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/colors`, getColors);
/**
 * @swagger
 * /colors:
 *   post:
 *     tags:
 *      - Colors  
 *     summary: Thêm màu
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(`/colors`, addColor);
/**
 * @swagger
 * /colors/:id:
 *   delete:
 *     tags:
 *      - Colors  
 *     summary: Xoá màu
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete(`/colors/:id`, deleteColor);
/**
 * @swagger
 * /colors/:id:
 *   put:
 *     tags:
 *      - Colors  
 *     summary: Cập nhật màu
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put(`/colors/:id`, editColor);
/**
 * @swagger
 * /colors/:id:
 *   get:
 *     tags:
 *      - Colors  
 *     summary: Lấy màu theo id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/color/:id`, getColorById);

module.exports = router;
