// Retryable, transient errors from the Gemini API.
// 503 UNAVAILABLE ("high demand") and 429 (rate limit) are explicitly retryable;
// 500 is a transient server error worth one or two retries as well.
const RETRYABLE_STATUS = new Set([429, 500, 503]);

function getStatus(error: unknown): number | null {
    if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: unknown }).status;
        if (typeof status === 'number') {
            return status;
        }
    }
    return null;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs an async operation with exponential backoff on transient Gemini errors.
 *
 * Free-tier Gemini periodically returns 503 "high demand" / UNAVAILABLE even when
 * the caller is well under their rate limits, because capacity is best-effort and
 * shared. These errors are transient, so a short retry usually succeeds.
 */
export async function withGeminiRetry<T>(
    operation: () => Promise<T>,
    { retries = 3, baseDelayMs = 500 }: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            const status = getStatus(error);
            const isRetryable = status !== null && RETRYABLE_STATUS.has(status);

            if (!isRetryable || attempt === retries) {
                throw error;
            }

            // Exponential backoff with jitter: ~0.5s, ~1s, ~2s (+/- jitter).
            const delay = baseDelayMs * 2 ** attempt + Math.random() * baseDelayMs;
            await sleep(delay);
        }
    }

    throw lastError;
}
