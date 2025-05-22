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
router.post(`/posts`, addPost);
router.put('/blogs/:id', updatePost);
router.post(`/upload-thumbnail-blog`, upload.single("blog"), uploadBlog);
router.get(`/posts`, getAllPosts);
router.get(`/detailblog/:slug`, getPostBySlug);
router.get(`/blog/:id`, getPostById);
router.get(`/relatedposts/:tag`, getRelatedPostsByTag);
router.delete(`/posts/:postId`, deletePost);
router.post(
  `/upload-gallery-blog`,
  upload.array("photos", 10),
  uploadGalleryBlog
);
module.exports = router;
