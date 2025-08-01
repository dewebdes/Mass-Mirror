import { checkCORSFlags } from '../modules/diagnostics/corsChecker.js';
import { isSimpleRequest } from '../modules/diagnostics/simpleRequestClassifier.js';

async function fetchFlows() {
    try {
        const response = await fetch('/api/flows');
        return await response.json();
    } catch (err) {
        console.error('Flow fetch failed:', err);
        return [];
    }
}

function createRow(flow) {
    const corsResult = checkCORSFlags(flow);
    const simpleFlag = isSimpleRequest(flow);

    const row = document.createElement('tr');

    row.innerHTML = `
    <td>${flow.url || '—'}</td>
    <td>${flow.requestHeaders?.origin || '—'}</td>
    <td>${flow.method}</td>
    <td>${corsResult.flag ? '❗' : '✅'}</td>
    <td>${simpleFlag ? 'Simple' : 'Non-simple'}</td>
    <td>${corsResult.anomalies.length ? corsResult.anomalies.join(', ') : '—'}</td>
  `;

    return row;
}

async function populateTable() {
    const tableBody = document.querySelector('#flowTable tbody');
    tableBody.innerHTML = '';

    const flows = await fetchFlows();
    flows.forEach(flow => {
        const row = createRow(flow);
        tableBody.appendChild(row);
    });
}

setInterval(populateTable, 5000);
