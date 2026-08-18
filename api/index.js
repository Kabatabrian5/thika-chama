const express = require('express');
const app = express();

app.use(express.json());

// In-memory mock state
let groupWallets = { savings: 100000, merryGoRound: 60000, welfare: 24500, finesPool: 0 };
let members = [
    { id: 1, name: 'John Doe', phone: '254712345678', status: 'PAID' },
    { id: 2, name: 'Mary Akinyi', phone: '254722334455', status: 'PENDING' }
];

// Serve the Login/Dashboard UI directly at the root URL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Umoja Chama System</title>
            <style>
                :root { --primary: #0f766e; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; }
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                body { background-color: var(--bg); color: var(--text); padding: 20px; display: flex; justify-content: center; }
                .container { width: 100%; max-width: 500px; }
                h1 { font-size: 1.4rem; color: var(--primary); margin-bottom: 5px; }
                p.sub { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; }
                .card { background: var(--card); border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .card h3 { font-size: 0.95rem; margin-bottom: 10px; color: #334155; }
                .wallet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .wallet-box { background: #f1f5f9; padding: 10px; border-radius: 8px; font-size: 0.8rem; }
                .wallet-box span { font-weight: bold; display: block; color: var(--primary); font-size: 1.05rem; margin-top: 3px; }
                .btn { display: block; width: 100%; background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; text-align: center; margin-top: 10px; }
                .btn:hover { background: #115e59; }
                ul { list-style: none; font-size: 0.85rem; }
                li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
                .badge-paid { color: #16a34a; font-weight: bold; }
                .badge-pending { color: #dc2626; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Umoja Chama System</h1>
                <p class="sub">Live Dashboard Prototype</p>
                <div class="card">
                    <h3>Group Wallet Balances</h3>
                    <div class="wallet-grid">
                        <div class="wallet-box">Savings Wallet <span id="w-savings">Loading...</span></div>
                        <div class="wallet-box">Merry-Go-Round <span id="w-mgr">Loading...</span></div>
                        <div class="wallet-box">Welfare Fund <span id="w-welfare">Loading...</span></div>
                        <div class="wallet-box">Fines Pool <span id="w-fines">Loading...</span></div>
                    </div>
                </div>
                <div class="card">
                    <h3>Member Contribution Status</h3>
                    <ul id="member-list"><li>Loading members...</li></ul>
                </div>
                <button class="btn" onclick="simulateContribution()">Simulate Ksh 4,000 Payment Split</button>
            </div>
            <script>
                async function fetchState() {
                    let res = await fetch('/api/state');
                    let data = await res.json();
                    document.getElementById('w-savings').innerText = 'Ksh ' + data.groupWallets.savings.toLocaleString();
                    document.getElementById('w-mgr').innerText = 'Ksh ' + data.groupWallets.merryGoRound.toLocaleString();
                    document.getElementById('w-welfare').innerText = 'Ksh ' + data.groupWallets.welfare.toLocaleString();
                    document.getElementById('w-fines').innerText = 'Ksh ' + data.groupWallets.finesPool.toLocaleString();
                    let listHTML = '';
                    data.members.forEach(m => {
                        let statusClass = m.status === 'PAID' ? 'badge-paid' : 'badge-pending';
                        listHTML += \`<li>\${m.name} <span class="\${statusClass}">\${m.status}</span></li>\`;
                    });
                    document.getElementById('member-list').innerHTML = listHTML;
                }
                async function simulateContribution() {
                    let res = await fetch('/api/split-contribution', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: 4000 })
                    });
                    let data = await res.json();
                    if(data.success) {
                        alert('Ksh 4,000 contribution successfully split into wallets!');
                        fetchState();
                    }
                }
                fetchState();
            </script>
        </body>
        </html>
    `);
});

// API Endpoints
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

module.exports = app;
