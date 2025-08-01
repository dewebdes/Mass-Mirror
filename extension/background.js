const requestCache = {};

// 🧠 Capture request headers before the request is sent
chrome.webRequest.onBeforeSendHeaders.addListener(
    ({ requestId, requestHeaders }) => {
        requestCache[requestId] = { requestHeaders };
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
);

// 🪞 Emit feed to mirror server
function emitToMirror(feed) {
    const mirror = new WebSocket('ws://localhost:9222/mirror');
    mirror.addEventListener('open', () => {
        console.log('[Mass-Mirror] Emitting feed to mirror...');
        mirror.send(JSON.stringify(feed));
        mirror.close();
    });
    mirror.addEventListener('error', (err) => {
        console.error('[Mass-Mirror] Mirror emission failed:', err);
    });
    mirror.addEventListener('close', (event) => {
        console.log(`[Mass-Mirror] Mirror socket closed with code ${event.code}`);
    });
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Mass-Mirror] Extension installed.');
});

// 📄 Capture initial page load
chrome.webRequest.onCompleted.addListener(
    (details) => {
        chrome.storage.local.get(['fetchEnabled'], (prefs) => {
            if (!prefs.fetchEnabled) return;

            const feed = {
                type: 'initial-page',
                method: details.method,
                url: details.url,
                tabId: details.tabId,
                statusCode: details.statusCode,
                requestHeaders: requestCache[details.requestId]?.requestHeaders || null,
                responseHeaders: details.responseHeaders || null,
                body: null
            };

            delete requestCache[details.requestId];
            console.log('[Mass-Mirror] Initial page feed emitted:', feed);
            emitToMirror(feed);
        });
    },
    {
        urls: ["<all_urls>"],
        types: ["main_frame"]
    },
    ["responseHeaders", "extraHeaders"]
);

// 🧩 Inject scripts based on prefs after navigation
chrome.webNavigation.onCompleted.addListener(({ tabId, frameId }) => {
    if (frameId !== 0) return;

    chrome.storage.local.get(['wsEnabled', 'fetchEnabled', 'injectEnabled'], (prefs) => {
        const { wsEnabled = false, fetchEnabled = false, injectEnabled = false } = prefs;
        const scripts = [];

        if (wsEnabled) {
            scripts.push('contentScripts/wsMirror.js');
            console.log('[Mass-Mirror] Queued wsMirror.js for injection.');
        }

        if (fetchEnabled && injectEnabled) {
            scripts.push('contentScripts/fetchMirror.js');
            console.log('[Mass-Mirror] Queued fetchMirror.js for injection (injectEnabled: true).');
        } else if (fetchEnabled) {
            console.log('[Mass-Mirror] fetchEnabled is true, but injectEnabled is false — using passive listener only.');
        }

        if (scripts.length) {
            chrome.scripting.executeScript({
                target: { tabId, allFrames: false },
                files: scripts
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[Mass-Mirror] Script injection failed:', chrome.runtime.lastError.message);
                } else {
                    console.log('[Mass-Mirror] Scripts injected successfully into tab', tabId);
                }
            });
        } else {
            console.log('[Mass-Mirror] No scripts injected: preferences disable injection.');
        }
    });
});

// 🕸️ Passive Listener for Completed Requests (merge headers)
chrome.webRequest.onCompleted.addListener(
    (details) => {
        chrome.storage.local.get(['fetchEnabled'], (prefs) => {
            if (!prefs.fetchEnabled) return;

            const feed = {
                type: 'passive-fetch',
                method: details.method,
                url: details.url,
                statusCode: details.statusCode,
                requestHeaders: requestCache[details.requestId]?.requestHeaders || null,
                responseHeaders: details.responseHeaders || null,
                body: null
            };

            delete requestCache[details.requestId];
            console.log('[Mass-Mirror] Passive fetch merged:', feed);
            emitToMirror(feed);
        });
    },
    {
        urls: ["<all_urls>"],
        types: ["xmlhttprequest"]
    },
    ["responseHeaders", "extraHeaders"]
);
