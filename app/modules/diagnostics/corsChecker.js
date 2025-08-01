import fs from 'fs';
import path from 'path';

const logPath = path.resolve('./logs/cors.log');

function prependToLog(fullPacket) {
    try {
        if (!fs.existsSync('./logs')) {
            fs.mkdirSync('./logs');
        }

        const previousLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
        const newLogEntry = `[${new Date().toISOString()}]\n${JSON.stringify(fullPacket, null, 2)}\n\n`;
        fs.writeFileSync(logPath, newLogEntry + previousLog, 'utf8');
    } catch (err) {
        console.error(`[corsChecker] Log write failed: ${err.message}`);
    }
}

export function checkCORSFlags(flow) {
    const result = {
        flag: false,
        anomalies: []
    };

    const headers = Array.isArray(flow?.responseHeaders) ? flow.responseHeaders : [];
    const headerDump = [];

    headers.forEach((headerObj, index) => {
        const { name, value } = headerObj;
        headerDump.push({ index, name, value });

        if (name?.toLowerCase().includes("access-control-allow")) {
            result.flag = true;
            result.anomalies.push(`Detected ACA header: ${name}: ${value}`);
            console.log(`[corsChecker] ACA Header → ${name}: ${value}`);
        }

        console.log(`Header [${index}] → Name: ${name}, Value: ${value}`);
    });

    // Add headerDump and anomalies inline before logging entire flow
    const logPacket = {
        ...flow,
        headerDump,
        anomalies: result.anomalies,
        timestamp: new Date().toISOString()
    };

    prependToLog(logPacket);
    return result;
}
