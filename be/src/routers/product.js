const express = require("express");
const { upload } = require("../config/multer");
const {
  getProduct,
  addProduct,
  uploadThumbnail,
  uploadGallery,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductAll,
  getProductBySlug,
  searchProduct,
  filterProducts,
  updateProductsCategoris,
  getMostViewedProducts,
  uploadVariant,
} = require("../controllers/product");

const router = express.Router();

router.put('/categories/update-products', updateProductsCategoris);
/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *      - Products  
 *     summary: Lấy danh sách sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/products`, getProduct);
/**
 * @swagger
 * /products/slug/:slug:
 *   get:
 *     tags:
 *      - Products  
 *     summary: Lấy danh sách sản phẩm theo slug
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/products/slug/:slug`, getProductBySlug);
router.get(`/products/filter`, filterProducts);
/**
 * @swagger
 * /products/:id:
 *   get:
 *     tags:
 *      - Products  
 *     summary: Lấy danh sách sản phẩm theo id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/products/:id`, getProductById);
/**
 * @swagger
 * /product:
 *   get:
 *     tags:
 *      - Products  
 *     summary: Lấy danh sách sản phẩm All
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/product`, getProductAll);
/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *      - Products  
 *     summary: Thêm sản phẩm mới
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/products`, addProduct);
/**
 * @swagger
 * /products/slug/:slug:
 *   post:
 *     tags:
 *      - Products  
 *     summary: Upload thumbnail sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
  `/upload-thumbnail-product`,
  upload.single("image"),
  uploadThumbnail
);
/**
 * @swagger
 * /products/slug/:slug:
 *   post:
 *     tags:
 *      - Products  
 *     summary: Upload image variant sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
  `/upload-variant-product`,
  upload.single("variant"),
  uploadVariant
);
/**
 * @swagger
 * /products/slug/:slug:
 *   post:
 *     tags:
 *      - Products  
 *     summary: Upload image gallery sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post(
  `/upload-gallery-product`,
  upload.array("photos", 10),
  uploadGallery
);
/**
 * @swagger
 * /products/:id:
 *   put:
 *     tags:
 *      - Products  
 *     summary: update sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put(`/products/:id`, updateProduct);
/**
 * @swagger
 * /products/slug/:slug:
 *   delete:
 *     tags:
 *      - Products  
 *     summary: Xoá sản phẩm
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete(`/products/:id`, deleteProduct);
router.get('/search', searchProduct);
router.get("/most-viewed", getMostViewedProducts);


module.exports = router;
