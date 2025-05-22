const CustomerInfo = require("../models/customerInfor");

const createCustomer = async (req, res) => {
  try {
    const { userId, name, phone, city, district, ward, address, isDefault } = req.body;

    if (!userId || !name || !phone || !city || !district || !ward || !address) {
      return res.status(400).json({
        success: false,
        message: "Các trường userId, name, phone, city, district, ward, address là bắt buộc!",
      });
    }

    const existingCustomers = await CustomerInfo.find({ userId });

    let isDefaultValue = !!isDefault; 

    if (existingCustomers.length === 0) {
      isDefaultValue = true;
    }

    if (isDefaultValue) {
      await CustomerInfo.updateMany({ userId }, { isDefault: false });
    }

    const newCustomer = new CustomerInfo({
      userId,
      name,
      phone,
      city,
      district,
      ward,
      address,
      isDefault: isDefaultValue, 
    });

    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: "Khách hàng được tạo thành công!",
      data: newCustomer,
    });
  } catch (error) {
    console.error("Lỗi khi tạo khách hàng:", error);

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra trong quá trình tạo khách hàng!",
      error: error.message, 
    });
  } 
};

  
const getCustomers = async (req, res) => {
  try {
      const { userId } = req.params;
      const customerInfos = await CustomerInfo.find({ userId });

      if (customerInfos.length === 0) {
          return res.status(404).json({
              success: false,
              message: "Không tìm thấy địa chỉ nào cho khách hàng.",
          });
      }

      // Kiểm tra xem có địa chỉ nào đang là mặc định không
      let hasDefault = customerInfos.some((info) => info.isDefault);

      // Nếu không có địa chỉ nào được đặt làm mặc định, gán địa chỉ đầu tiên làm mặc định
      if (!hasDefault && customerInfos.length > 0) {
          customerInfos[0].isDefault = true;
          await customerInfos[0].save(); // Lưu cập nhật vào database
      }

      return res.status(200).json({
          success: true,
          message: "Danh sách địa chỉ của khách hàng.",
          data: customerInfos,
      });
  } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      return res.status(500).json({
          success: false,
          message: "Có lỗi xảy ra khi lấy danh sách địa chỉ!",
      });
  }
};

  
  const editCustomer = async (req, res) => {
    try {
      const { id, userId } = req.params;
      const { name, phone, city, district, ward, address, isDefault } = req.body;
  
      if (!userId || !id) {
        return res.status(400).json({
          success: false, 
          message: "Thiếu userId hoặc id trong yêu cầu!",
        });
      }
  
      if (!name || !phone || !city || !district || !ward || !address) {
        return res.status(400).json({
          success: false,
          message: "Thiếu dữ liệu cần thiết trong payload!",
        });
      }
  
      const customer = await CustomerInfo.findOne({ _id: id, userId });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy khách hàng!",
        });
      }
  
      if (isDefault) {
        await CustomerInfo.updateMany(
          { userId },
          { $set: { isDefault: false } }
        );
      }
  
      Object.assign(customer, { name, phone, city, district, ward, address, isDefault });
      const updatedCustomer = await customer.save();
  
      const hasDefault = await CustomerInfo.findOne({ userId, isDefault: true });
      if (!hasDefault) {
        const firstCustomer = await CustomerInfo.findOne({ userId }).sort({ _id: 1 });
        if (firstCustomer) {
          firstCustomer.isDefault = true;
          await firstCustomer.save();
        }
      }
  
      return res.status(200).json({
        success: true,
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ:", error.message);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi trong quá trình xử lý!",
      });
    }
  };
  
  const getCustomerById = async (req, res) => {
    try {
      const { userId } = req.params; 
  
      const customerInfo = await CustomerInfo.findOne({ userId, isDefault: true });
  
      if (!customerInfo) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy địa chỉ mặc định cho khách hàng.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Địa chỉ mặc định của khách hàng.",
        data: customerInfo,
      });
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ khách hàng:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy địa chỉ khách hàng.",
      });
    }
  };
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params; 

    const customer = await CustomerInfo.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng với ID được cung cấp!",
      });
    }

    await customer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Khách hàng đã được xóa thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xóa khách hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xóa khách hàng!",
    });
  }
};

const editCustomerAddress = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { isDefault } = req.body; 
    if (!userId || !id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc id trong yêu cầu!",
      });
    }

    const customer = await CustomerInfo.findOne({ _id: id, userId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ của khách hàng!",
      });
    }

    if (isDefault !== undefined) {
      if (isDefault) {
        
        await CustomerInfo.updateMany(
          { userId, _id: { $ne: id } },
          { $set: { isDefault: false } }
        );
      }
      customer.isDefault = isDefault; 
    }


    const updatedCustomer = await customer.save();

    
    const hasDefault = await CustomerInfo.exists({ userId, isDefault: true });
    if (!hasDefault) {
      const firstCustomer = await CustomerInfo.findOne({ userId }).sort({ _id: 1 });
      if (firstCustomer) {
        firstCustomer.isDefault = true;
        await firstCustomer.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xử lý!",
    });
  }
};

module.exports = { createCustomer, getCustomers, editCustomer, getCustomerById, deleteCustomer, editCustomerAddress};
