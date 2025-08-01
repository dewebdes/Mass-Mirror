// dashboard/server.js — HTTP Intake for Mass-Mirror (No WS Conflict)

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import settings from '../config/settings.json' assert { type: "json" };
import { getFlows } from '../utils/flowStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Serve dashboard HTML and public assets
app.use(express.static(path.join(__dirname, '../dashboard')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/modules', express.static(path.join(__dirname, '../modules')));


// 🧭 Serve dashboard.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// REST endpoint for flow polling (used by dashboardClient.js)
app.get('/api/flows', (req, res) => {
    const flows = getFlows();
    res.json(flows);
});

// Start HTTP server using configured port (9222)
export function startDashboardServer(port = settings.port) {
    server.listen(port, () => {
        console.log(`📡 Dashboard server listening on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        console.error(`[dashboard] Server failed to bind: ${err.message}`);
    });
}

// 🔓 Export the raw HTTP server for WS upgrades via mirrorServer
export { server };
