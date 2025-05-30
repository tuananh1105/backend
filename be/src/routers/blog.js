const express = require("express");
const { upload } = require("../config/multer");
const {
  addPost,
  getAllPosts,
  getPostBySlug,
  getRelatedPostsByTag,
  deletePost,
  uploadBlog,
  uploadGalleryBlog,
  updatePost,
  getPostById,
} = require("../controllers/blog");
const router = express.Router();

// Middleware để parse JSON
router.use(express.json()); // Giúp parse req.body

// Đổi từ GET sang POST cho thêm bài viết
/**
 * @swagger
 * /posts:
 *   post:
 *     tags:
 *      - Blogs  
 *     summary: Thêm bài viết
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/posts`, addPost);
/**
 * @swagger
 * /blogs/:id:
 *   put:
 *     tags:
 *      - Blogs  
 *     summary: Cập nhật bài viết
 *     responses:
 *       201:
 *         description: Thành công
 */
router.put('/blogs/:id', updatePost);
/**
 * @swagger
 * /upload-thumbnail-blog:
 *   post:
 *     tags:
 *      - Uploads  
 *     summary: Upload thumbnail bài viết
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/upload-thumbnail-blog`, upload.single("blog"), uploadBlog);
/**
 * @swagger
 * /posts:
 *   get:
 *     tags:
 *      - Blogs  
 *     summary: Lấy danh sách bài viết
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/posts`, getAllPosts);
/**
 * @swagger
 * /detailblog/:slug:
 *   get:
 *     tags:
 *      - Blogs  
 *     summary: Lấy bài viết theo slug
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/detailblog/:slug`, getPostBySlug);
/**
 * @swagger
 * /blog/:id:
 *   get:
 *     tags:
 *      - Blogs  
 *     summary: Lấy bài viết theo id
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(`/blog/:id`, getPostById);
router.get(`/relatedposts/:tag`, getRelatedPostsByTag);
/**
 * @swagger
 * /posts/:postId:
 *   delete:
 *     tags:
 *      - Blogs  
 *     summary: Xoá bài viết
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete(`/posts/:postId`, deletePost);
/**
 * @swagger
 * /upload-gallery-blog:
 *   post:
 *     tags:
 *      - Uploads  
 *     summary: Upload gallery bài viết
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(
  `/upload-gallery-blog`,
  upload.array("photos", 10),
  uploadGalleryBlog
);
module.exports = router;
