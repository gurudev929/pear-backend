import mongoose from 'mongoose';

const IconSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    minlength: 3,
  },
}, { timestamps: true });

const Icon = mongoose.model("Icon", IconSchema);
export default Icon;
