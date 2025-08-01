// mirrorServer.js — Mass-Mirror Intake via WebSocket (ESM-compatible)

import { WebSocketServer } from 'ws';
import { routeFlowEvent } from './feedRouter.js';
import { logger } from './utils/logger.js';
import { checkCORSFlags } from './modules/diagnostics/corsChecker.js';
import { isSimpleRequest } from './modules/diagnostics/simpleRequestClassifier.js';

const feedStats = {
    total: 0,
    methods: {},
    status: {},
    corsIssues: 0,
    simple: 0,
    complex: 0
};

function updateFeedStats(event) {
    feedStats.total++;

    if (event.method) {
        feedStats.methods[event.method] = (feedStats.methods[event.method] || 0) + 1;
    }

    if (event.statusCode) {
        feedStats.status[event.statusCode] = (feedStats.status[event.statusCode] || 0) + 1;
    }

    // CORS diagnostic
    const cors = checkCORSFlags(event);
    if (cors.flag) {
        feedStats.corsIssues++;
    }

    // Simplicity diagnostic
    const simple = isSimpleRequest(event);
    if (simple) {
        feedStats.simple++;
    } else {
        feedStats.complex++;
    }

    return { cors, simple };
}

function renderFeedBlock(stats) {
    const methodDisplay = JSON.stringify(stats.methods, null, 2);
    const statusDisplay = JSON.stringify(stats.status, null, 2);

    const block = `
╭────────────────────────────────────────────────────────────────╮
│        📡 Mass-Mirror Diagnostic Pulse                         │
├────────────────────────────────────────────────────────────────┤
│   🔄 Total Requests: ${stats.total.toString().padStart(5)}                         │
│                                                                │
│   🔹 Methods:                                                  │
${methodDisplay.split('\n').map(line => '│   ' + line.padEnd(62)).join('\n')}
│                                                                │
│   🟢 Status Codes:                                             │
${statusDisplay.split('\n').map(line => '│   ' + line.padEnd(62)).join('\n')}
│                                                                │
│   🚨 CORS Anomalies: ${stats.corsIssues.toString().padStart(5)}                      │
│   🧘 Simple Requests: ${stats.simple.toString().padStart(5)}                      │
│   ⚙️  Complex Requests: ${stats.complex.toString().padStart(5)}                     │
╰────────────────────────────────────────────────────────────────╯
`.trim();

    process.stdout.write('\x1Bc'); // Clear console
    console.log(block);
}

export function createMirrorServer({ dashboard }) {
    const wss = new WebSocketServer({ noServer: true });

    dashboard.on('upgrade', (request, socket, head) => {
        if (request.url === '/mirror') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws) => {
        logger.system('[mirrorServer] Mirror connection established.');

        ws.on('error', (err) => {
            logger.system(`[mirrorServer] Socket error: ${err.message}`);
        });

        ws.on('message', (message) => {
            let event;
            try {
                event = JSON.parse(message);
            } catch (err) {
                logger.system(`[mirrorServer] Malformed JSON: ${err.message}`);
                return;
            }

            try {
                // Default tabId if missing
                if (!event.tabId) {
                    event.tabId = 'background';
                }

                const diagnostics = updateFeedStats(event);
                renderFeedBlock(feedStats);

                // Extended console diagnostics
                //console.log(`[Feed] ID: ${event.id || 'N/A'}`);
                console.log(`CORS: [${diagnostics.cors.flag}] → ${diagnostics.cors.anomalies.join(', ') || 'None'}`);
                console.log(`Simplicity: [${diagnostics.simple ? '🧘 Simple' : '⚙️ Complex'}]`);
                console.log('─'.repeat(60));

                logger.log(event.tabId, event);
                routeFlowEvent(event);
            } catch (err) {
                logger.system(`[mirrorServer] Event routing error: ${err.message}`);
            }
        });

        ws.on('close', (code) => {
            logger.system(`[mirrorServer] Mirror connection closed with code ${code}`);
        });
    });
}
