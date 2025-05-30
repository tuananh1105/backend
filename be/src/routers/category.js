const express = require("express");
const {
  deleteCategory,
  addCategory,
  getCategoryById,
  getCategorys,
  updateCategory,
  getCategoryBySlug,
  getRootCategory,
  getCategoryShow,
} = require("../controllers/category");

const router = express.Router();
/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *      - Category  
 *     summary: Lấy danh sách danh mục
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/categories`, getCategorys);
/**
 * @swagger
 * /category:
 *   get:
 *     tags:
 *      - Category  
 *     summary: Lấy danh sách danh mục theo trạng thái
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/category`, getCategoryShow);

router.get(`/categories/danh-muc-goc-a`, getRootCategory);
/**
 * @swagger
 * /categorys/:id:
 *   get:
 *     tags:
 *      - Category  
 *     summary: Lấy danh sách danh mục theo id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/categorys/:id`, getCategoryById);
/**
 * @swagger
 * /categories:
 *   post:
 *     tags:
 *      - Category  
 *     summary: Thêm danh mục
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/categories`, addCategory);
/**
 * @swagger
 * /categories/:slug:
 *   get:
 *     tags:
 *      - Category  
 *     summary: Lấy danh mục theo slug
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/categories/:slug`, getCategoryBySlug);
/**
 * @swagger
 * /categorys/:id:
 *   put:
 *     tags:
 *      - Category  
 *     summary: Sửa danh mục
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put(`/categorys/:id`, updateCategory);
  /**
 * @swagger
 * /categorys/:id:
 *   delete:
 *     tags:
 *      - Category  
 *     summary: Xoá danh mục
 *     responses:
 *       201:
 *         description: Thành công
 */
router.delete(`/categorys/:id`, deleteCategory);
module.exports = router;
