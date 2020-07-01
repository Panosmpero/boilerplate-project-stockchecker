const { Schema, model } = require("mongoose");

const stockSchema = new Schema({
  stock: { type: String, required: true, unique: true },
  price: { type: String },
  likes: { type: [String], default: [] }
});

const Stock = model("Stock", stockSchema);

module.exports = Stock;
