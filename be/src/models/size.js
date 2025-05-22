const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    minHeight: {
      type: Number,
      required: true,
    },
    maxHeight: {
      type: Number,
      required: true,
    },
    minWeight: {
      type: Number,
      required: true,
    },
    maxWeight: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Size", sizeSchema);
