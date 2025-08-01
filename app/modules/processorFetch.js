// processorFetch.js (ESM-compatible)

import { checkCORSFlags } from './diagnostics/corsChecker.js';
import { isSimpleRequest } from './diagnostics/simpleRequestClassifier.js'; // or keep classifyRequestSimplicity
import { flowFormatter } from '../utils/flowFormatter.js';
import { storeFlow, getFlows, clearFlows, getSessionIds } from '../utils/flowStore.js';
import { logger } from '../utils/logger.js';

export function processFetchFlow(flow) {
    if (!flow?.url || !flow?.method) {
        logger('[processorFetch] Incomplete fetch flow.');
        return;
    }

    // 🧭 Step 1: Determine request simplicity
    const isSimple = isSimpleRequest(flow);

    // 🧪 Step 2: CORS anomaly inspection
    const corsResult = checkCORSFlags(flow);

    // 🍪 Step 3: Cookie presence analysis
    const hasCookies = {
        request: Boolean(flow.requestHeaders?.cookie),
        response: Boolean(flow.responseHeaders?.['set-cookie'])
    };

    // 🎨 Step 4: Format for symbolic dashboard view
    const formatted = flowFormatter({
        time: flow.time,
        tabId: flow.tabId,
        method: flow.method,
        url: flow.url,
        status: flow.status,
        origin: flow.origin,
        isSimple,
        corsFlag: corsResult.flag,
        webSocket: false,
        cookies: hasCookies,
        diagnostics: corsResult.flag ? ['CORS'] : [],
        responseHeaders: flow.responseHeaders,
        requestHeaders: flow.requestHeaders,
        body: flow.responseBody
    });

    // 🗂️ Step 5: Archive for expandability and future arcs
    storeFlow(flow.tabId || 'global', formatted);


    logger(`[processorFetch] Flow processed: ${flow.method} ${flow.url}`);
}
