import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    blockNumber: { type: Number, required: true },
    timeStamp: { type: Number, required: true },
    hash: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    value: { type: Number, required: true },
    gas: { type: Number, required: true },
    gasPrice: { type: Number, required: true },
    isError: { type: Number, required: true },
    txreceipt_status: { type: Number, required: true },
    input: { type: String, required: true },
    contractAddress: { type: String, required: false },
    cumulativeGasUsed: { type: Number, required: true },
    gasUsed: { type: Number, required: true },
    confirmations: { type: Number, required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export { Transaction };
