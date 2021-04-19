const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  title: String,
  newPrice: String,
  oldPrice: String,
  newStock: String,
  oldStock: String,
  sku: String,
  company: String,
  url: String,
  updateStatus: String,
});

module.exports = Product = mongoose.model("Product", ProductSchema);
