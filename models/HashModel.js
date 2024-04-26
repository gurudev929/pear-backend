import mongoose from 'mongoose';

const HashSchema = new mongoose.Schema({
  contract: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  pool_id: {
    type: Number,
    required: true,
  },
  hash_value: {
    type: String,
    required: true,
    unique: true,
  },  
},{ timestamps: true });

HashSchema.index(
  { contract: 1, creator: 1, pool_id: 1}, 
  { "unique": true }
);

const Hash = mongoose.model("Hash", HashSchema);
export default Hash;
