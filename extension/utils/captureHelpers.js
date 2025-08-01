export function formatHeaders(headersArray) {
    return headersArray.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
}

export function truncateBody(body, maxLength = 8000) {
    if (typeof body !== 'string') return '';
    return body.length > maxLength ? body.slice(0, maxLength) + '...[truncated]' : body;
}

export function annotateFlow({ url, method, status }) {
    const trustSymbol = status >= 200 && status < 300 ? '✅' :
        status >= 400 ? '⚠️' : '❓';

    return `[${method}] ${url} → ${status} ${trustSymbol}`;
}

export function safeDecode(body) {
    try {
        return decodeURIComponent(body);
    } catch {
        return body;
    }
}
