import { date } from "zod";

type AIIntent =
    | {
        type: 'TOP_SPENDING_CATEGORY';
        month: number;
        year: number;
      }
    | {
        type: 'TOTAL_SPENDING';
        month: number;
        year: number;
      }
    | {
        type: 'UNKNOWN';
      };

const MONTHS: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,

    januar: 1,
    februar: 2,
    mart: 3,
    april_sr: 4,
    maj: 5,
    jun: 6,
    jul: 7,
    avgust: 8,
    septembar: 9,
    oktobar: 10,
    novembar: 11,
    decembar: 12
};

class AIIntentService {
    private static normalize(text: string) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    private static extractRelativeDate(prompt: string): { month: number; year: number } | null {
        const normalized = this.normalize(prompt);
        const now = new Date();

        if (normalized.includes('this month') || normalized.includes('ovog meseca') || normalized.includes('ovaj mesec')) {
            return {
                month: now.getMonth() + 1,
                year: now.getFullYear()
            };
        }

        if (normalized.includes('last month') || normalized.includes('proslog meseca') || normalized.includes('prosli mesec')) {
            const currentMonth = now.getMonth() + 1;
            if (currentMonth === 1) {
                return {
                    month: 12,
                    year: now.getFullYear() - 1
                };
            }

            return {
                month: currentMonth - 1,
                year: now.getFullYear()
            };
        }

        return null;
    }

    private static extractMonth(prompt: string): number | null {
        const normalized = this.normalize(prompt);

        const monthPatterns: Array<[RegExp, number]> = [
            [/\bjanuary\b/, 1],
            [/\bfebruary\b/, 2],
            [/\bmarch\b/, 3],
            [/\bapril\b/, 4],
            [/\bmay\b/, 5],
            [/\bjune\b/, 6],
            [/\bjuly\b/, 7],
            [/\baugust\b/, 8],
            [/\bseptember\b/, 9],
            [/\boctober\b/, 10],
            [/\bnovember\b/, 11],
            [/\bdecember\b/, 12],

            [/\bjanuar\b/, 1],
            [/\bfebruar\b/, 2],
            [/\bmart\b/, 3],
            [/\bapril\b/, 4],
            [/\bmaj\b/, 5],
            [/\bjun\b/, 6],
            [/\bjul\b/, 7],
            [/\bavgust\b/, 8],
            [/\bseptembar\b/, 9],
            [/\boktobar\b/, 10],
            [/\bnovembar\b/, 11],
            [/\bdecembar\b/, 12],
        ];

        for (const [pattern, month] of monthPatterns) {
            if (pattern.test(normalized)) return month;
        }

        return null;
    }

    private static extractYear(prompt: string): number | null {
        const normalized = this.normalize(prompt);
        const match = normalized.match(/\b(20\d{2})\b/);
        if (!match) return null;
        return Number(match[1]);
    }

    static parse(prompt: string): AIIntent {
        const normalized = this.normalize(prompt);

        const asksTopSpending =
            normalized.includes('najvise trosio') ||
            normalized.includes('najvise potrosio') ||
            normalized.includes('na sta sam najvise trosio') ||
            normalized.includes('top spending') ||
            normalized.includes('spent the most') ||
            normalized.includes('what did i spend the most on');

        const asksTotalSpending =
            normalized.includes('how much have i spent in total') ||
            normalized.includes('spent in total') ||
            normalized.includes('total spending') ||
            normalized.includes('spending so far') ||
            normalized.includes('koliko sam ukupno potrosio') ||
            normalized.includes('koliko sam ukupno trosio') ||
            normalized.includes('ukupno potrosio') ||
            normalized.includes('ukupna potrosnja');

        if (asksTopSpending || asksTotalSpending) {
            const relative = this.extractRelativeDate(prompt);
            const month = relative?.month ?? this.extractMonth(prompt) ?? new Date().getMonth() + 1;
            const year = relative?.year ?? this.extractYear(prompt) ?? new Date().getFullYear();


            if(asksTopSpending){
                return {
                    type: 'TOP_SPENDING_CATEGORY',
                    month,
                    year
                };
            }
            else{
                return {
                    type: 'TOTAL_SPENDING',
                    month,
                    year
                };
            }
            
        }

        return { type: 'UNKNOWN' };
    }
}

export default AIIntentService;
export type { AIIntent };