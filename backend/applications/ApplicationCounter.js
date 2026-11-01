import mongoose from 'mongoose';

const applicationCounterSchema = new mongoose.Schema({
  _id: String,
  sequence: { type: Number, default: 0 },
});

export default mongoose.model('ApplicationCounter', applicationCounterSchema);