import mongoose from 'mongoose';

const ethPriceSchema = new mongoose.Schema({
    price: Number,
    timestamp: Date
});

const EthPrice = mongoose.model('EthPrice', ethPriceSchema);

export { EthPrice };