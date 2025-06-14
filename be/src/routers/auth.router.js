const express = require("express");
const { upload } = require("../config/multer");
const {
  signin,
  signup,
  requestResetPassword,
  processResetPassword,
  getUserInfo,
  updatePassword,
  getAllUsers,
  updateAccount,
  verifyOldPassword,
  updateUser,
  updateUserStatus,
  uploadAvatar,
  getAllCustomers, 
} = require("../controllers/auth");
const router = express.Router();
/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *      - Auth  
 *     summary: Đăng ký
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/signup`, signup);
/**
 * @swagger
 * /signin:
 *   post:
 *     tags:
 *      - Auth  
 *     summary: Đăng nhập
 *     responses:
 *       201:
 *         description: Thành công
 */
router.post(`/signin`, signin);
router.post("/request-reset-password", requestResetPassword);
router.post("/check-valid-code", processResetPassword);
router.post("/update-new-password", updatePassword);
router.get("/users", getAllUsers);
router.get("/user/info/:userId", getUserInfo);
router.put("/user/update/:userId", updateAccount);
router.put("/user/update", updateUser);
router.patch("/users/:userId/status", updateUserStatus);
router.post(
  `/upload-avatar`,
  upload.single("file"),
  uploadAvatar
);

router.post("/verify-old-password", verifyOldPassword);
router.get("/customer-user", getAllCustomers);
module.exports = router;
