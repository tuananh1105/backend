const Color = require("../models/color");


const getColors = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
  
    try {
      // Lấy danh sách màu với phân trang
      const colors = await Color.find()
        .limit(Number(limit))
        .skip(Number(skip));
  
      // Đếm tổng số màu
      const totalItems = await Color.countDocuments();
  
      return res.status(200).json({
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: Number(page),
          limit: Number(limit),
        },
        data: colors,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const addColor = async (req, res) => {
    try {
        const color = await Color.create({
            name: req.body.name,
            colorCode: req.body.colorCode,
        })
        return res.status(201).json({
            message: "Tạo color thành công",
            color,
        });
    } catch (error) {
        if(error.code === 11000){
            return res.status(400).json({
                message: "Color đã tồn tại"
            })
        }
        res.status(500).json({ message: error.message });
    }
}

const editColor = async (req, res) => {
  try {
    const { name, colorCode } = req.body;
    const { id } = req.params;

    const color = await Color.findByIdAndUpdate(
      id,
      { name, colorCode },
      { new: true, runValidators: true }
    );

    if (!color) {
      return res.status(404).json({ message: "Không tìm thấy màu cần cập nhật" });
    }

    return res.status(200).json({
      message: "Cập nhật color thành công",
      color,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Color đã tồn tại"
      });
    }
    res.status(500).json({ message: error.message });
  }
};


const deleteColor = async (req, res) => {
  try {
    const data = await Color.findByIdAndDelete(req.params.id);
    if (data.length < 0) {
      return res.status(404).json({ message: "Không có màu nào" });
    }
    return res.status(201).json({ messages: "Xóa màu sắc thành công", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findById(id);

    if (!color) {
      return res.status(404).json({ message: "Không tìm thấy màu" });
    }

    return res.status(200).json({
      message: "Lấy thông tin color thành công",
      ...color.toObject(), 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
    getColors,
    addColor,
    deleteColor,
    editColor,
    getColorById,
}