// feedRouter.js (ESM-compatible)

import { processFetchFlow } from './modules/processorFetch.js';
import { processWSFlow } from './modules/processorWS.js';
import { logger } from './utils/logger.js';

export function routeFlowEvent(event) {
    if (!event || !event.type) {
        logger('[feedRouter] Invalid event received.');
        return;
    }

    switch (event.type) {
        case 'fetch':
            processFetchFlow(event.payload);
            break;

        case 'websocket':
            processWSFlow(event.payload);
            break;

        default:
            logger(`[feedRouter] Unknown event type: ${event.type}`);
    }
}
