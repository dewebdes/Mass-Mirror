const flowMemory = new Map(); // tab/session ID → list of flows

export function storeFlow(tabId, flow) {
    if (!tabId || !flow) return;

    if (!flowMemory.has(tabId)) {
        flowMemory.set(tabId, []);
    }

    flowMemory.get(tabId).push(flow);
}

export function getFlows(tabId = null) {
    if (tabId) {
        return flowMemory.get(tabId) || [];
    }

    return Array.from(flowMemory.values()).flat();
}

export function clearFlows(tabId) {
    if (tabId) {
        flowMemory.delete(tabId);
    }
}

export function getSessionIds() {
    return Array.from(flowMemory.keys());
}
