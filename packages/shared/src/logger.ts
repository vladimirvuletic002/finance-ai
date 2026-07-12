type LogMeta = Record<string, unknown>;

/**
 * Minimal structured (JSON) logger. Each line is a single JSON object with a
 * timestamp, level, message, and optional metadata (e.g. requestId), so logs
 * can be parsed/aggregated by any log shipper without extra dependencies.
 */
function log(level: 'info' | 'warn' | 'error', message: string, meta?: LogMeta) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
    };
    const line = JSON.stringify(entry);

    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
}

const logger = {
    info: (message: string, meta?: LogMeta) => log('info', message, meta),
    warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
    error: (message: string, meta?: LogMeta) => log('error', message, meta),
};

export default logger;
