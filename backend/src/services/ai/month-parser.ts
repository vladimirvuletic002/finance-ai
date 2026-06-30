// Parses a free-text prompt (English or Serbian) into a target month/year.
// Extracted from ai-chat.service so the logic can be unit-tested in isolation.

const MONTH_PATTERNS: Array<[RegExp, number]> = [
    [/\bjanuary\b|\bjanuar\b/, 1],
    [/\bfebruary\b|\bfebruar\b/, 2],
    [/\bmarch\b|\bmart\b/, 3],
    [/\bapril\b/, 4],
    [/\bmay\b|\bmaj\b/, 5],
    [/\bjune\b|\bjun\b/, 6],
    [/\bjuly\b|\bjul\b/, 7],
    [/\baugust\b|\bavgust\b/, 8],
    [/\bseptember\b|\bseptembar\b/, 9],
    [/\boctober\b|\boktobar\b/, 10],
    [/\bnovember\b|\bnovembar\b/, 11],
    [/\bdecember\b|\bdecembar\b/, 12],
];

export interface RequestedMonth {
    month: number;
    year: number;
}

export function normalizePrompt(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function resolveRequestedMonth(prompt: string, now: Date = new Date()): RequestedMonth | null {
    const normalized = normalizePrompt(prompt);

    if (normalized.includes('last month') || normalized.includes('proslog meseca') || normalized.includes('prosli mesec')) {
        const currentMonth = now.getMonth() + 1;
        if (currentMonth === 1) {
            return { month: 12, year: now.getFullYear() - 1 };
        }

        return { month: currentMonth - 1, year: now.getFullYear() };
    }

    if (normalized.includes('this month') || normalized.includes('ovog meseca') || normalized.includes('ovaj mesec')) {
        return { month: now.getMonth() + 1, year: now.getFullYear() };
    }

    for (const [pattern, month] of MONTH_PATTERNS) {
        if (pattern.test(normalized)) {
            const yearMatch = normalized.match(/\b(20\d{2})\b/);
            return {
                month,
                year: yearMatch ? Number(yearMatch[1]) : now.getFullYear()
            };
        }
    }

    return null;
}

export function buildMonthKey(month: number, year: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}
