const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: function () {
      return !this.isFreeShipping;
    },
    validate: {
      validator: function (v) {
        return v <= 100; 
      },
      message: "Discount cannot be more than 100%",
    },
  },
  minOrder: {
    type: Number,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date, 
    required: false,
  },
  maxDiscountAmount: {
    type: Number, 
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFreeShipping: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
