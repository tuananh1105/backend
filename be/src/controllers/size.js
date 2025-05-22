const Size = require("../models/size");


const getSizes = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
  
    try {
      const sizes = await Size.find()
        .limit(Number(limit))
        .skip(Number(skip));
  
      const totalItems = await Size.countDocuments();
  
      return res.status(200).json({
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: Number(page),
          limit: Number(limit),
        },
        data: sizes,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const addSize = async (req, res) => {
    try {
        const sizes = await Size.create(req.body);
        return res.status(201).json({
            message: "Tạo size thành công",
            sizes,
        });
    } catch (error) {
        if(error.code === 11000){
            return res.status(400).json({
                message: "Size đã tồn tại"
            })
        }
        res.status(500).json({ message: error.message });
    }
}


const deleteSize = async (req, res) => {
  try {
    const data = await Size.findByIdAndDelete(req.params.id);
    if (data.length < 0) {
      return res.status(404).json({ message: "Không có kích thước nào" });
    }
    return res.status(201).json({ messages: "Xóa kích thước thành công", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSizeById = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await Size.findById(id);

    if (!size) {
      return res.status(404).json({ message: "Không tìm thấy size" });
    }

    return res.status(200).json({
      message: "Lấy thông tin size thành công",
      ...size.toObject(), 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editSize = async (req, res) => {
  try {
    const { name, minHeight, maxHeight, minWeight, maxWeight } = req.body;
    const { id } = req.params;

    const size = await Size.findByIdAndUpdate(
      id,
      { name, minHeight, maxHeight, minWeight, maxWeight },
      { new: true, runValidators: true }
    );

    if (!size) {
      return res.status(404).json({ message: "Không tìm thấy size cần cập nhật" });
    }

    return res.status(200).json({
      message: "Cập nhật size thành công",
      size,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Size đã tồn tại"
      });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getSizes,
    addSize,
    deleteSize,
    getSizeById,
    editSize,
}