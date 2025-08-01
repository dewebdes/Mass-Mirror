// logger.js — Mass-Mirror Logging Utility

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve('./logs');

function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function logFlow(tabId, flow) {
    ensureLogDir();
    const timestamp = new Date().toISOString();
    const filename = path.join(LOG_DIR, `${tabId}.log`);
    const logEntry = {
        timestamp,
        url: flow.url || '—',
        method: flow.method || '—',
        origin: flow.requestHeaders?.origin || '—',
        status: flow.status || '—',
        corsFlag: flow.corsFlag || '—',
        simplicity: flow.simplicity || '—',
        insight: flow.insight || '—'
    };

    const entryString = JSON.stringify(logEntry);

    fs.appendFile(filename, entryString + '\n', err => {
        if (err) console.error(`Logger error for ${tabId}:`, err);
    });

    // Echo feed to app console
    console.log(`[feed:${tabId}] ${entryString}`);
}


function logSystem(message) {
    ensureLogDir();
    const filename = path.join(LOG_DIR, `system.log`);
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message };
    fs.appendFile(filename, JSON.stringify(logEntry) + '\n', err => {
        if (err) console.error(`Logger system error:`, err);
    });
}

export const logger = {
    log: logFlow,
    system: logSystem
};
