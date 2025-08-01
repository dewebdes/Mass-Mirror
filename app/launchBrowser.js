import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Launches Chrome with a dynamic profile and loads extension.
 * @param {string} startURL - Initial URL to open in Chrome.
 * @param {object} options - Optional flags: { ephemeral: true/false }
 */
export async function launchBrowser(startURL, { ephemeral = true } = {}) {
    console.log('🌀 [launch] Preparing Chrome profile...');

    const profileDir = path.join(process.cwd(), 'profiles');
    const profileName = ephemeral ? `session-${Date.now()}` : 'mirrorSession';
    const profilePath = path.join(profileDir, profileName);

    fs.mkdirSync(profilePath, { recursive: true });
    const resolvedProfile = path.resolve(profilePath);

    const extensionPath = path.resolve('C:/2025/mass-mirror/extension');

    const chromeExePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

    const chromeArgs = [
        `--user-data-dir=${resolvedProfile}`,
        `--load-extension=${extensionPath}`,
        '--remote-debugging-port=9223',
        '--disable-popup-blocking',
        '--disable-background-networking',
        '--window-size=1280,800',
        '--disable-features=AutomationControlled',
        '--no-first-run',
        '--new-window',
        startURL
    ];

    const chromeArgs0 = [
        `--user-data-dir=${resolvedProfile}`,
        `--load-extension=${extensionPath}`,
        '--disable-extensions-except=' + extensionPath,
        '--remote-debugging-port=9223',
        '--disable-popup-blocking',
        '--window-size=1280,800',
        '--disable-features=AutomationControlled',
        '--no-first-run',
        '--new-window',
        startURL
    ];


    spawn(chromeExePath, chromeArgs, {
        shell: true,
        detached: true,
        stdio: 'ignore'
    });

    console.log('✅ [launch] Chrome launched with profile:', profileName);

    // Optional cleanup for ephemeral profiles
    if (ephemeral) {
        process.on('exit', () => {
            try {
                fs.rmSync(resolvedProfile, { recursive: true, force: true });
                console.log('🧹 [cleanup] Profile removed:', resolvedProfile);
            } catch (err) {
                console.error('⚠️ [cleanup] Failed to delete profile:', err);
            }
        });
    }

    return null; // fire-and-forget
}
