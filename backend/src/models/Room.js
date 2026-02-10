const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  image_url: { type: String },
});

module.exports = mongoose.model('Room', roomSchema);
