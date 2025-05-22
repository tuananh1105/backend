const mongoose = require("mongoose");

// Định nghĩa schema cho Variant
const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  imageVariant: {
    type: String,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    required: function () {
      // Chỉ yêu cầu SKU khi có biến thể
      return !this.hasVariants;
    },
  },
});

// Middleware để tự động tạo SKU cho variant trước khi lưu
variantSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `${Date.now()}-${this.size}-${this.color}`;
  }
  next();
});

// Định nghĩa schema cho Product
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
    },
    gallery: {
      type: [String],
    },
    description: {
      type: String,
    },
    detaildescription: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    hasVariants: {
      type: Boolean,
      required: true,
      default: false, 
    },
    variants: [variantSchema], // Chỉ chứa dữ liệu nếu hasVariants = true
    viewCount: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: function() {
        // Nếu không có variants, countInStock là bắt buộc
        return !this.hasVariants;
      },
      default: 0,
    },
    weight: {
      type: Number,
      required: function() {
        // Nếu không có variants, weight là bắt buộc
        return !this.hasVariants;
      },
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

// Middleware để tính toán lại countInStock và weight trước khi lưu
productSchema.pre("save", function(next) {
  if (this.hasVariants) {
    // Tính lại tổng số lượng trong kho và trọng lượng từ các variant
    this.countInStock = this.variants.reduce((total, variant) => {
      return total + (variant.countInStock || 0);
    }, 0);

    this.weight = this.variants.reduce((total, variant) => {
      return total + (variant.weight || 0);
    }, 0);
  }
  next();
});

// Xuất mô hình Product
module.exports = mongoose.model("Product", productSchema);
