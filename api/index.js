const express = require('express');
const app = express();

app.use(express.json());

// In-memory mock state for your prototype
let groupWallets = { savings: 100000, merryGoRound: 60000, welfare: 24500, finesPool: 0 };
let members = [
    { id: 1, name: 'John Doe', phone: '254712345678', status: 'PAID' },
    { id: 2, name: 'Mary Akinyi', phone: '254722334455', status: 'PENDING' }
];

// Custom 4000 Split Route
app.post('/api/split-contribution', (req, res) => {
    let { amount } = req.body;
    if (amount === 4000) {
        groupWallets.savings += 2500;
        groupWallets.merryGoRound += 1000;
        groupWallets.welfare += 500;
    }
    res.json({ success: true, groupWallets });
});

app.get('/api/state', (req, res) => {
    res.json({ groupWallets, members });
});

// Export for Vercel serverless runtime (Do NOT use app.listen)
module.exports = app;
