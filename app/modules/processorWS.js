// processorWS.js (ESM-compatible)

import { flowFormatter } from '../utils/flowFormatter.js';
import { storeFlow, getFlows, clearFlows, getSessionIds } from '../utils/flowStore.js';
import { logger } from '../utils/logger.js';

export function processWSFlow(flow) {
    if (!flow || !flow.url || !flow.upgradeHeaders) {
        logger('[processorWS] Incomplete WebSocket flow.');
        return;
    }

    // Step 1: Check if upgrade succeeded
    const wsUpgraded = flow.upgradeHeaders['upgrade']?.toLowerCase() === 'websocket';

    // Step 2: Summarize upgrade result
    const wsSymbol = wsUpgraded ? '💬' : '↔️';

    // Step 3: Format for dashboard
    const formatted = flowFormatter({
        time: flow.time,
        tabId: flow.tabId,
        method: 'GET', // WS handshake is always GET
        url: flow.url,
        status: flow.status,
        origin: flow.origin,
        isSimple: null,
        corsFlag: null,
        webSocket: wsSymbol,
        cookies: {
            request: !!flow.requestHeaders?.cookie,
            response: !!flow.responseHeaders?.['set-cookie']
        },
        diagnostics: ['WebSocket'],
        responseHeaders: flow.responseHeaders,
        requestHeaders: flow.requestHeaders,
        body: flow.initialFrame || null
    });

    // Step 4: Cache flow
    storeFlow(flow.tabId || 'global', formatted);


    logger(`[processorWS] WS ${wsSymbol} ${flow.url}`);
}
