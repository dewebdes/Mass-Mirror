(function () {
    const OriginalWebSocket = window.WebSocket;

    function MirrorWebSocket(url, protocols) {
        console.log('[Mass-Mirror] Wrapping WebSocket to:', url);

        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

        const mirror = new OriginalWebSocket('ws://localhost:9222'); // Your reflection server

        mirror.addEventListener('open', () => {
            console.log('[Mass-Mirror] Mirror WebSocket opened. Signaling ws-open to:', url);
            mirror.send(JSON.stringify({ type: 'ws-open', url }));
        });

        mirror.addEventListener('error', (err) => {
            console.error('[Mass-Mirror] Mirror WebSocket error:', err);
        });

        ws.addEventListener('open', () => {
            console.log('[Mass-Mirror] Target WebSocket opened:', url);
        });

        ws.addEventListener('message', (event) => {
            console.log('[Mass-Mirror] Inbound WebSocket message:', event.data);

            mirror.send(JSON.stringify({
                type: 'ws-message',
                direction: 'inbound',
                data: event.data,
                url
            }));
        });

        const originalSend = ws.send;
        ws.send = function (data) {
            console.log('[Mass-Mirror] Outbound WebSocket message:', data);

            mirror.send(JSON.stringify({
                type: 'ws-message',
                direction: 'outbound',
                data,
                url
            }));

            originalSend.call(ws, data);
        };

        return ws;
    }

    window.WebSocket = MirrorWebSocket;
})();
