import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  contract: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });

AdminSchema.index(
  { contract: 1, address: 1}, 
  { "unique": true }
);

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
