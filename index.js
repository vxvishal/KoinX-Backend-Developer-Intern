import * as dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import cors from 'cors';
import { Transaction } from './models/transaction.js';
import { Balance } from './models/balance.js';
import { EthPrice } from './models/ethPrice.js';
dotenv.config()

const app = express();

app.use(cors());

// Connect to MongoDB
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

// function to fetch Ethereum price and store in database
async function fetchAndStoreEthPrice() {
    try {
        const coingeckoAPI = process.env.COINGECKO_API_URL;
        let fetchError = false, response;
        await axios.get(coingeckoAPI)
            .then((res) => {
                fetchError = false;
                response = res;
            })
            .catch((err) => {
                fetchError = true;
            });

        if (!fetchError) {
            const ethPrice = response.data.ethereum.inr;
            const ethPriceData = new EthPrice({
                price: ethPrice,
                timestamp: Date.now()
            });
            await ethPriceData.save();
            console.log(`Stored Ethereum price: ${ethPrice} INR`);
        }

        else {
            console.log("Error fetching Ethereum price");
        }

    } catch (error) {
        console.error(`Error fetching and storing Ethereum price: ${error}`);
    }
}

// call fetchAndStoreEthPrice every 10 minutes
setInterval(fetchAndStoreEthPrice, 600000);

// API routes
app.get('/', (req, res) => { res.send("APIs are up and running") });

// API endpoint to fetch transactions and store in database
app.get('/transactions/:address', async (req, res) => {
    const address = req.params.address;

    // Fetch transactions from Etherscan API
    const etherscanAPI = process.env.ETHERSCAN_API_URL + address;
    let response, fetchError = false;

    await axios.get(etherscanAPI)
        .then((res) => {
            fetchError = false;
            response = res;
        })
        .catch((err) => {
            fetchError = true;
        });

    // Save transactions to MongoDB
    if (!fetchError) {
        const transactions = response.data.result.map((tx) => new Transaction(tx));
        await Transaction.insertMany(transactions);

        // Return transactions
        res.json(transactions);
    }

    else {
        console.log("Error fetching transactions");
    }
});

// API endpoint for getting balance and price of Ethereum
app.get('/balance/:address', async (req, res) => {
    const { address } = req.params;

    // Fetch latest price of Ethereum in INR
    const coingeckoAPI = process.env.COINGECKO_API_URL;
    let data, fetchError = false;
    await axios.get(coingeckoAPI).
        then((response) => {
            fetchError = false;
            data = response;
        })
        .catch((error) => {
            fetchError = true;
        });

    if (!fetchError) {
        const etherPriceInInr = data.data.ethereum.inr;

        // Retrieve transactions for the given address from the database
        const transactions = await Transaction.find({ $or: [{ from: address }, { to: address }] });

        // Calculate current balance for the given address
        let balance = 0;
        transactions.forEach(transaction => {
            if (transaction.to === address) {
                balance += parseFloat(transaction.value);
            } else if (transaction.from === address) {
                balance -= parseFloat(transaction.value);
            }
        });

        // Store current balance in the database
        await Balance.findOneAndUpdate({ address }, { balance }, { upsert: true });

        // Return current balance and price of Ethereum in INR for the given address
        res.json({ balance, etherPriceInInr });
    }

    else {
        console.log("Error fetching balance");
    }
});

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));
