import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  contract: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

SettingSchema.index(
  { contract: 1, name: 1 },
  { "unique": true }
);

const Setting = mongoose.model("Setting", SettingSchema);
export default Setting;
