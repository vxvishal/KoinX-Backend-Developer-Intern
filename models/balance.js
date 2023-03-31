import mongoose from 'mongoose';

const balanceSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    balance: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
});

const Balance = mongoose.model('Balance', balanceSchema);

export { Balance };