const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const cloudinary = require("../config/cloudinary.config");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format: "png", // Không cần async function
    public_id: (req, file) => path.parse(file.originalname).name, // Tránh lỗi nếu file không có đuôi
    transformation: [
      { width: 300, height: 300, crop: "limit" }, // Resize ảnh để tối ưu
    ],
  },
});

const upload = multer({ storage });

module.exports = { upload };
