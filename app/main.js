// main.js — Mass-Mirror Entrypoint

import { launchBrowser } from './launchBrowser.js';
import { createMirrorServer } from './mirrorServer.js';
import { startDashboardServer, server as dashboardServer } from './dashboard/server.js';
import settings from './config/settings.json' assert { type: "json" };

console.log('🔧 [mass-mirror] Bootstrapping system...');

(async () => {
    // Launch Chrome with diagnostic flags and mirrored profile
    await launchBrowser(settings.startURL, { ephemeral: false });

    // Start dashboard + WebSocket intake on defined port (9222)
    startDashboardServer(settings.port);

    // Attach WebSocket server with upgrade path listener
    createMirrorServer({ dashboard: dashboardServer });

    console.log(`✅ [mass-mirror] Server listening on ws://localhost:${settings.port}/mirror`);
})();
