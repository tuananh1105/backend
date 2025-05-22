const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

const colorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    colorCode: {
      type: String,
      require: true,
  }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Color", colorSchema);
