(function () {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        console.log('[Mass-Mirror] Intercepting fetch call with arguments:', args);

        const requestInfo = {
            type: 'fetch-request',
            method: args[1]?.method || 'GET',
            url: args[0],
            headers: args[1]?.headers || {},
            body: args[1]?.body || null
        };

        console.log('[Mass-Mirror] Constructed requestInfo:', requestInfo);

        try {
            const response = await originalFetch(...args);
            const clone = response.clone();

            console.log(`[Mass-Mirror] Fetch response received. Status: ${response.status}, URL: ${args[0]}`);

            clone.text().then(bodyText => {
                const payload = {
                    type: 'fetch-response',
                    url: args[0],
                    status: response.status,
                    headers: [...response.headers.entries()],
                    body: bodyText
                };

                console.log('[Mass-Mirror] Constructed response payload:', payload);

                const mirror = new WebSocket('ws://localhost:9222'); // Replace with your server URL

                mirror.addEventListener('open', () => {
                    console.log('[Mass-Mirror] WebSocket connection opened. Sending payload...');
                    mirror.send(JSON.stringify({ request: requestInfo, response: payload }));
                    mirror.close();
                });

                mirror.addEventListener('error', (err) => {
                    console.error('[Mass-Mirror] WebSocket connection error:', err);
                });
            });

            return response;
        } catch (err) {
            console.warn('[Mass-Mirror] Fetch interception error:', err);
            return originalFetch(...args);
        }
    };
})();
