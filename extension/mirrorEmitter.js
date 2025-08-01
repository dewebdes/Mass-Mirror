// mirrorEmitter.js

export function emitToMirror(feed) {
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
