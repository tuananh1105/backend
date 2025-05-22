const bcryptjs = require("bcryptjs");
const { registerSchema, signinSchema } = require("../schemas/auth");
const User = require("../models/user");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const Mail = require("../helpers/node-mailler");
const mongoose = require("mongoose");

const signup = async (req, res) => {
  try {
    // Lấy dữ liệu từ client gửi lên: req.body
    const { username, email, password, confirmPassword, avatar, phone } =
      req.body;

    // Kiểm tra username không chứa dấu hoặc ký tự đặc biệt và không vượt quá 10 ký tự
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Chỉ cho phép chữ, số và dấu gạch dưới
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        field: "username",
        message: "Tên người dùng không được chứa dấu hoặc ký tự đặc biệt!",
      });
    }
    if (username.length > 10) {
      return res.status(400).json({
        field: "username",
        message: "Tên người dùng không được vượt quá 10 ký tự!",
      });
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/; // Chỉ cho phép số, độ dài từ 10-11
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        field: "phone",
        message: "Số điện thoại không hợp lệ! Phải chứa 10-11 chữ số.",
      });
    }

    // Kiểm tra dữ liệu từ client gửi lên có đúng với schema không
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(({ message }) => message);
      return res.status(400).json({
        messages,
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        field: "username",
        message: "Tên người dùng đã được sử dụng",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        field: "email",
        message: "Email đã được sử dụng",
      });
    }

    // Kiểm tra phone đã tồn tại
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        field: "phone",
        message: "Số điện thoại đã được sử dụng",
      });
    }

    // Mã hóa password
    const hashPassword = await bcryptjs.hash(password, 10);
    const role = (await User.countDocuments({})) === 0 ? "admin" : "user";

    // Tạo mới user
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      avatar,
      role,
      phone,
    });

    const token = jwt.sign({ userId: user._id }, "123456", { expiresIn: "1h" });

    // Trả về client thông tin user vừa tạo
    user.password = undefined;
    return res.status(201).json({
      message: "Đăng ký thành công",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
    });
  }
};

const signin = async (req, res) => {
  try {
    // Lấy dữ liệu từ client gửi lên
    const { email, password } = req.body;

    // Kiểm tra dữ liệu có hợp lệ không
    const { error } = signinSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((error) => error.message);
      return res.status(400).json({
        field: "validation",
        messages,
      });
    }

    // Kiểm tra email có tồn tại trong DB không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        field: "email",
        message: "Email chưa được đăng ký",
      });
    }

    // Kiểm tra trạng thái của tài khoản
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        field: "status",
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        field: "password",
        message: "Mật khẩu không đúng",
      });
    }

    // Tạo token nếu đăng nhập thành công
    const token = jwt.sign({ userId: user._id }, "123456", { expiresIn: "1h" });

    // Xóa mật khẩu trước khi trả về client
    user.password = undefined;

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.",
    });
  }
};


let EMAIL = null;

const requestResetPassword = async (req, res) => {
  // get email ( user nhập vào email)
  try {
    const { email } = req.body;
    // check email có tôn tại trên hệ thống
    const accounts = await User.find();
    const emails = accounts.map((acc) => acc.email);

    if (!emails.includes(email)) res.json("Invalid Email");

    EMAIL = email;

    // create token
    const resetPasswordToken = jwt.sign(
      {
        data: "resetpassword",
      },
      "SECRET",
      {
        expiresIn: 60,
      }
    );
    // send email with code
    if (!resetPasswordToken) return;
    const messageId = Mail.sendResetPassword(email, resetPasswordToken);
    res.json(messageId);
  } catch (error) {
    console.log(error);
  }
};

//http://localhost:5173/reset-password?code=12345

const processResetPassword = async (req, res) => {
  const { code } = req.body;
  if (!code) return;

  // check expires code
  try {
    const decoded = jwt.verify(code, "SECRET");
    res.json("Token Valid");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.json({
        message: "Token expired",
      });
    } else {
      res.json("Token is invalid:", error.message);
    }
  }
};

// client send { newPasword: ... }
const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return;
  try {
    // mã hóa password
    const hashPassword = await bcryptjs.hash(newPassword, 10);
    // tạo mới user
    const result = await User.updateOne(
      { email: EMAIL },
      { password: hashPassword }
    );

    if (result.modifiedCount > 0) {
      res.json("Reset password success!");
    } else {
      res.json("No user found with this email.");
    }
  } catch (error) {
    res.json("error while hash new password");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Mặc định page = 1, limit = 10
    const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua

    // Fetch users với phân trang
    const users = await User.find().skip(skip).limit(parseInt(limit));

    // Đếm tổng số user
    const totalUsers = await User.countDocuments();

    // Kiểm tra nếu không có user
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }

    // Trả về danh sách users với metadata phân trang
    res.status(200).json({
      message: "Users fetched successfully",
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};


const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Lấy danh sách khách hàng từ bảng User
    const customers = await User.find().skip(skip).limit(parseInt(limit));
    const totalCustomers = await User.countDocuments();

    // Xử lý dữ liệu cho từng khách hàng
    const customerData = await Promise.all(
      customers.map(async (customer) => {
        // Lấy đơn hàng dựa trên userId trong bảng Order
        const orders = await Order.find({ userId: customer._id });

        // Nếu không có đơn hàng hoặc không có đơn hàng thành công, bỏ qua khách hàng này
        if (orders.length === 0 || orders.filter(order => order.status === "delivered").length === 0) {
          return null; // Trả về null nếu khách hàng chưa mua hàng
        }

        // Tính toán các thông tin cần thiết
        const totalOrders = orders.length; // Tổng số đơn hàng
        const canceledOrders = orders.filter(order => order.status === "canceled").length; // Số đơn hủy
        const successfulOrders = orders.filter(order => order.status === "delivered").length; // Số đơn thành công
        const pendingOrders = orders.filter(order => order.status === "pending").length; // Số đơn đang chờ

        // Tính tổng số tiền từ các đơn hàng thành công
        const totalAmount = orders
          .filter(order => order.status === "delivered")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        return {
          _id: customer._id,
          name: customer.name || customer.username || customer.fullName || "Unknown", // Thử các trường khác nhau
          avatar: customer.avatar || "https://res.cloudinary.com/dfjsl3isc/image/upload/v1736418158/products/anh.png", // Avatar mặc định nếu không có
          totalOrders, // Số đơn hàng
          canceledOrders, // Số đơn hủy hàng
          successfulOrders, // Số đơn hàng thành công
          pendingOrders, // Số đơn hàng đang chờ
          totalAmount, // Số tiền hàng
          rank: 0, // Xếp hạng (hiện tại để là 0 như trong bảng)
        };
      })
    );

    // Lọc bỏ các khách hàng không có đơn hàng thành công
    const filteredCustomerData = customerData.filter(customer => customer !== null);

    // Trả về kết quả
    res.status(200).json({
      message: "Customers fetched successfully",
      customers: filteredCustomerData,
      pagination: {
        totalCustomers: filteredCustomerData.length,
        totalPages: Math.ceil(filteredCustomerData.length / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching customers",
      error: error.message,
    });
  }
};



const getUserInfo = async (req, res) => {
  // Lấy userId từ header (ví dụ: từ 'user-id' header)
  const userId = req.headers["user-id"];

  if (!userId) {
    return res.status(400).json({
      message: "userId is required in header",
    });
  }

  // Kiểm tra xem userId có phải là ObjectId hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid userId format",
    });
  }

  try {
    // Tìm người dùng trong database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Không trả về password để bảo mật
    user.password = undefined;

    return res.status(200).json({
      message: "User information fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching user information",
      error: error.message,
    });
  }
};
const updateAccount = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ URL params
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Tìm người dùng trong database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Kiểm tra mật khẩu mới có độ dài tối thiểu (tuỳ chọn)
    if (newPassword && newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Kiểm tra nếu mật khẩu mới trùng với mật khẩu cũ
    if (newPassword && oldPassword && newPassword === oldPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được giống với mật khẩu cũ",
      });
    }

    // Nếu có mật khẩu mới, kiểm tra mật khẩu cũ và cập nhật mật khẩu
    if (newPassword) {
      // Kiểm tra mật khẩu cũ
      if (!oldPassword) {
        return res.status(400).json({
          message: "Old password is required to change password", // Nếu mật khẩu cũ không có, thông báo lỗi
        });
      }

      const isOldPasswordValid = await bcryptjs.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        return res.status(400).json({
          message: "Mật khẩu cũ không đúng", // Thông báo khi mật khẩu cũ không đúng
        });
      }

      // Kiểm tra mật khẩu mới và mật khẩu xác nhận phải giống nhau
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        });
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      user.password = hashedPassword; // Cập nhật mật khẩu mới vào user
    }

    // Lưu lại thông tin cập nhật vào database
    await user.save();

    // Trả về thông tin người dùng sau khi cập nhật (không bao gồm password)
    user.password = undefined;

    return res.status(200).json({
      message: "Mật khẩu đã được cập nhật thành công",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi khi cập nhật mật khẩu",
      error: error.message,
    });
  }
};

const verifyOldPassword = async (req, res) => {
  const { userId, oldPassword } = req.body;

  if (!userId || !oldPassword) {
    return res.status(400).json({
      message: "userId và oldPassword là bắt buộc",
    });
  }

  try {
    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    // So sánh mật khẩu cũ với mật khẩu trong cơ sở dữ liệu
    const isMatch = await bcryptjs.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu cũ không chính xác",
      });
    }

    // Nếu mật khẩu cũ chính xác
    return res.status(200).json({
      message: "Mật khẩu cũ chính xác",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi xác minh mật khẩu cũ",
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    // Lấy userId từ req.user (giải mã từ token) hoặc body (frontend gửi qua localStorage)
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID không được cung cấp" });
    }

    const { username, email, phone } = req.body; // Lấy các thông tin cần cập nhật

    // Kiểm tra nếu không có dữ liệu nào để cập nhật
    if (!username && !email && !phone) {
      return res
        .status(400)
        .json({ message: "Không có thông tin để cập nhật" });
    }

    // **Validate dữ liệu mới**
    const errors = {};

    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/; // Chỉ cho phép chữ cái, số và dấu gạch dưới
      if (!usernameRegex.test(username)) {
        errors.username =
          "Tên không hợp lệ (chỉ chứa chữ cái, số và dấu gạch dưới)";
      }
    }
    if (username.length > 10) {
      return res.status(400).json({
        field: "username",
        message: "Tên người dùng không được vượt quá 10 ký tự!",
      });
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Kiểm tra định dạng email
      if (!emailRegex.test(email)) {
        errors.email = "Email không hợp lệ";
      }
    }

    if (phone) {
      const phoneRegex = /^[0-9]{10,11}$/;
      // Kiểm tra định dạng số điện thoại (10-11 chữ số)
      if (!phoneRegex.test(phone)) {
        errors.phone =
          "Số điện thoại không hợp lệ (chỉ chứa tối đa 10-11 chữ số)";
      }
    }

    // Nếu có lỗi validate, trả về thông báo lỗi
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Tìm người dùng theo userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra và gán giá trị mới cho từng trường (nếu có)
    if (username) {
      // Kiểm tra xem username đã tồn tại trong hệ thống chưa
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res
          .status(400)
          .json({ field: "username", message: "Tên người dùng đã tồn tại" });
      }
      user.username = username;
    }

    if (email) {
      // Kiểm tra xem email đã tồn tại trong hệ thống chưa
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ field: "email", message: "Email đã được sử dụng" });
      }
      user.email = email;
    }

    if (phone) {
      // Kiểm tra xem phone đã tồn tại trong hệ thống chưa
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return res
          .status(400)
          .json({ field: "phone", message: "Số điện thoại đã được sử dụng" });
      }
      user.phone = phone;
    }

    // Lưu thông tin người dùng sau khi cập nhật
    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      data: updatedUser,
    });
  } catch (error) {
    // Xử lý lỗi hệ thống
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Kiểm tra giá trị trạng thái hợp lệ
    const validStatuses = ["ACTIVE", "BLOCKED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        field: "status",
        message: "Trạng thái không hợp lệ! Chỉ chấp nhận 'ACTIVE' hoặc 'BLOCKED'.",
      });
    }

    // Tìm và cập nhật trạng thái người dùng
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    // Kiểm tra xem user có tồn tại không
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng.",
      });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.",
    });
  }
};

const uploadAvatar = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json(file.path);
};

module.exports = {
  signin,
  signup,
  requestResetPassword,
  processResetPassword,
  updatePassword,
  getAllUsers,
  getUserInfo,
  updateAccount,
  verifyOldPassword,
  updateUser,
  updateUserStatus,
  uploadAvatar,
  getAllCustomers,
};
