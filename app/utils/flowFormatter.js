export function flowFormatter(flow) {
    if (!flow) {
        return {
            url: '—',
            origin: '—',
            method: '—',
            corsFlag: '—',
            simplicity: '—',
            insight: '—'
        };
    }

    const { url, method, requestHeaders = {}, responseHeaders = {} } = flow;
    const upperMethod = method?.toUpperCase();

    // 🌐 CORS Diagnostics
    let corsFlag = '✅';
    const insight = [];

    const reqOrigin = requestHeaders['origin'];
    const resACAO = responseHeaders['access-control-allow-origin'];
    const credHeader = requestHeaders['credentials'] || requestHeaders['authorization'];

    if (resACAO && reqOrigin && resACAO !== '*' && resACAO !== reqOrigin) {
        corsFlag = '❗';
        insight.push('ACAO mismatch');
    }

    const nonSimpleMethods = ['PUT', 'DELETE', 'PATCH'];
    if (nonSimpleMethods.includes(upperMethod) && !resACAO) {
        corsFlag = '❗';
        insight.push('No ACAO on method');
    }

    if (credHeader && (!resACAO || resACAO === '*')) {
        corsFlag = '❗';
        insight.push('Credential risk');
    }

    // 🧭 Simplicity Classification
    const allowedMethods = ['GET', 'HEAD', 'POST'];
    const allowedContentTypes = [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
    ];

    let simplicity = 'Simple';
    const contentType = requestHeaders['content-type']?.toLowerCase();

    const customHeaders = Object.keys(requestHeaders).filter(h =>
        !['accept', 'accept-language', 'content-language', 'content-type'].includes(h.toLowerCase())
    );

    if (
        !allowedMethods.includes(upperMethod) ||
        (upperMethod === 'POST' && contentType && !allowedContentTypes.includes(contentType)) ||
        customHeaders.length > 0
    ) {
        simplicity = 'Non-simple';
    }

    // 📦 Final formatted summary
    return {
        url: url || '—',
        origin: reqOrigin || '—',
        method: method || '—',
        corsFlag,
        simplicity,
        insight: insight.length > 0 ? insight.join(', ') : '—'
    };
}
