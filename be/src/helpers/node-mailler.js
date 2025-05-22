const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVICE_ACC,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});
const Mail = {
  sendResetPassword: async (email, token) => {
    try {
      const info = await transporter.sendMail({
        from: '"Shop Baya xin thông báo !" <admin@ethereal.email>',
        to: email,
        subject: "Reset Password",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình tại <strong>Shop Baya</strong>. Vui lòng nhấn vào liên kết dưới đây để thay đổi mật khẩu của bạn:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:5173/reset-password?code=${token}"
                 style="background-color: #4CAF50; color: #fff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi cho đến khi bạn nhấp vào liên kết ở trên và tạo mật khẩu mới.</p>
            <p style="margin-top: 30px; color: #888;">Trân trọng,<br/>Đội ngũ hỗ trợ Shop Baya</p>
          </div>
        `,
      });
      return info.messageId;
    } catch (error) {
      console.error("Lỗi khi gửi email reset mật khẩu:", error);
      throw error; // Đẩy lỗi ra ngoài để có thể kiểm tra và xử lý
    }
  },

  sendOrderConfirmation: async (email, order) => {
    const info = await transporter.sendMail({
      from: '"Shop Baya" <admin@ethereal.email>',
      to: email,
      subject: "Xác nhận đơn hàng của bạn",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4CAF50; text-align: center;">Cảm ơn bạn đã đặt hàng tại Baya!</h2>
          <p style="text-align: center; font-size: 16px;">Đơn hàng của bạn đã được xác nhận. Dưới đây là chi tiết đơn hàng:</p>
          <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Thông tin khách hàng</h3>
          <p><strong>Tên:</strong> ${order.customerInfo.name}</p>
          <p><strong>Số điện thoại:</strong> ${order.customerInfo.phone}</p>
          <p><strong>Địa chỉ:</strong> ${order.customerInfo.address}, ${order.customerInfo.wards}, ${order.customerInfo.districts}, ${order.customerInfo.city}</p>

          <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; margin-top: 20px;">Chi tiết đơn hàng</h3>
          <p><strong style="color: #FF5733;">Mã đơn hàng:</strong> ${order.orderNumber}</p>
          <ul style="list-style-type: none; padding: 0;">
            ${order.items.map((item) => `
              <li style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <img src="${item.image}" alt="${item.name}" width="80" height="80" style="border: 1px solid #ddd; padding: 5px; margin-right: 15px; border-radius: 5px;" />
                <div>
                  <p style="margin: 0;"><strong>Sản phẩm:</strong> ${item.name}</p>
                  <p style="margin: 0;"><strong>Số lượng:</strong> ${item.quantity}</p>
                  <p style="margin: 0;"><strong>Giá:</strong> <span style="color: #FF5733;">${item.price} VND</span></p>
                  <p style="margin: 0;"><strong>Màu:</strong> ${item.color}</p>
                  <p style="margin: 0;"><strong>Kích thước:</strong> ${item.size}</p>
                </div>
              </li>
            `).join("")}
          </ul>
          <p style="font-size: 18px; font-weight: bold; color: #FF5733; margin-top: 20px;">Tổng giá trị đơn hàng: <span style="color: #4CAF50;">${order.totalPrice} VND</span></p>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="color: #555;">Chúng tôi sẽ liên hệ với bạn sớm để giao hàng.</p>
            <p style="color: #555;">Vui lòng theo dõi đơn hàng của bạn trên website để biết trạng thái đơn hàng của bạn!</p>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">Shop Baya xin cảm ơn quý khách!</p>
        </div>
      `,
    });

    return info.messageId;
  },

  translateOrderStatus: (status) => {
    const statusTranslations = {
    pendingPayment: 'Đang chờ thanh toán',
    pending: 'Đang chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipped: 'Đang giao hàng',
    received: 'Đã nhận hàng',
    delivered: 'Đã giao hàng',
    canceled: 'Đơn bị hủy',
    complaint: 'Khiếu nại',
    refund_in_progress: 'Đang hoàn trả hàng',
    refund_completed: 'Hoàn trả hàng thành công',
    exchange_in_progress: 'Đang đổi trả hàng',
    exchange_completed: 'Đổi trả hàng thành công',
    refund_done: 'Hoàn tiền thành công',
    refund_initiated: 'Chờ hoàn tiền',
    };

    return statusTranslations[status] || status;
  },

  sendOrderStatusUpdate: async (email, order) => {
    const translatedStatus = Mail.translateOrderStatus(order.status);

    const info = await transporter.sendMail({
      from: '"Shop Baya" <admin@ethereal.email>',
      to: email,
      subject: `Cập nhật trạng thái đơn hàng: ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <p>Đơn hàng của bạn với mã <strong>${order.orderNumber}</strong> hiện đang trong trạng thái: <strong style="color: #4CAF50;">${translatedStatus}</strong>.</p>

          <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Thông tin khách hàng</h3>
          <p><strong>Tên:</strong> ${order.customerInfo.name}</p>
          <p><strong>Số điện thoại:</strong> ${order.customerInfo.phone}</p>
          <p><strong>Địa chỉ:</strong> ${order.customerInfo.address}, ${order.customerInfo.wards}, ${order.customerInfo.districts}, ${order.customerInfo.city}</p>

          <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; margin-top: 20px;">Chi tiết đơn hàng</h3>
          <p><strong style="color: #FF5733;">Mã đơn hàng:</strong> ${order.orderNumber}</p>
          <ul style="list-style-type: none; padding: 0;">
            ${order.items.map((item) => `
              <li style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <img src="${item.image}" alt="${item.name}" width="80" height="80" style="border: 1px solid #ddd; padding: 5px; margin-right: 15px; border-radius: 5px;" />
                <div>
                  <p style="margin: 0;"><strong>Sản phẩm:</strong> ${item.name}</p>
                  <p style="margin: 0;"><strong>Số lượng:</strong> ${item.quantity}</p>
                  <p style="margin: 0;"><strong>Giá:</strong> <span style="color: #FF5733;">${item.price} VND</span></p>
                  <p style="margin: 0;"><strong>Màu:</strong> ${item.color}</p>
                  <p style="margin: 0;"><strong>Kích thước:</strong> ${item.size}</p>
                </div>
              </li>
            `).join("")}
          </ul>
          <p style="font-size: 18px; font-weight: bold; color: #FF5733; margin-top: 20px;">Tổng giá trị đơn hàng: <span style="color: #4CAF50;">${order.totalPrice} VND</span></p>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="color: #555;">Chúng tôi sẽ liên hệ với bạn sớm để giao hàng.</p>
            <p style="color: #555;">Vui lòng theo dõi đơn hàng của bạn trên website để biết trạng thái đơn hàng của bạn!</p>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">Shop Baya xin cảm ơn quý khách!</p>
        </div>
      `,
    });

    return info.messageId;
  },
};

module.exports = Mail;
