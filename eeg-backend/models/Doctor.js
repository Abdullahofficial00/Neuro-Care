const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  hospital: { type: String, required: true },
  age: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  card_number: { type: String, default: null },
  cvv: { type: String, default: null },
  exp_date: { type: String, default: null },
  subscription: { type: String, default: null },
  sub_start: { type: Date, default: null },
  sub_end: { type: Date, default: null }
});

module.exports = mongoose.model('Doctor', doctorSchema);
