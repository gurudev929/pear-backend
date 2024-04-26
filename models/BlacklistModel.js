import mongoose from 'mongoose';

const BlackListSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
}, { timestamps: true });

const Blacklist = mongoose.model("Blacklist", BlackListSchema);

export default Blacklist;
