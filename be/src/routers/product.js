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
router.get(`/products`, getProduct);
router.get(`/products/slug/:slug`, getProductBySlug);
router.get(`/products/filter`, filterProducts);
router.get(`/products/:id`, getProductById);
router.get(`/product`, getProductAll);

router.post(`/products`, addProduct);
router.post(
  `/upload-thumbnail-product`,
  upload.single("image"),
  uploadThumbnail
);

router.post(
  `/upload-variant-product`,
  upload.single("variant"),
  uploadVariant
);

router.post(
  `/upload-gallery-product`,
  upload.array("photos", 10),
  uploadGallery
);

router.put(`/products/:id`, updateProduct);

router.delete(`/products/:id`, deleteProduct);
router.get("/product", getProductAll);
router.get('/search', searchProduct);
router.get("/most-viewed", getMostViewedProducts);

module.exports = router;
