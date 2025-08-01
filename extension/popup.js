document.addEventListener('DOMContentLoaded', () => {
    const wsCapture = document.getElementById('wsCapture');
    const fetchCapture = document.getElementById('fetchCapture');
    const injectCapture = document.getElementById('injectCapture');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    chrome.storage.local.get(['wsEnabled', 'fetchEnabled', 'injectEnabled'], (data) => {
        wsCapture.checked = data.wsEnabled ?? true;
        fetchCapture.checked = data.fetchEnabled ?? false;
        injectCapture.checked = data.injectEnabled ?? false;
    });

    saveBtn.addEventListener('click', () => {
        chrome.storage.local.set({
            wsEnabled: wsCapture.checked,
            fetchEnabled: fetchCapture.checked,
            injectEnabled: injectCapture.checked
        }, () => {
            status.textContent = '✅ Settings saved.';
            setTimeout(() => status.textContent = '', 1500);
        });
    });
});
