/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
    { name: 'Food', icon: '🍔', color: '#f97316' },
    { name: 'Transport', icon: '🚗', color: '#3b82f6' },
    { name: 'Rent', icon: '🏠', color: '#8b5cf6' },
    { name: 'Utilities', icon: '💡', color: '#eab308' },
    { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
    { name: 'Salary', icon: '💰', color: '#22c55e' },
    { name: 'Savings', icon: '📈', color: '#14b8a6' },
    { name: 'Subscription', icon: '📺', color: '#ef4444' },
    { name: 'Health', icon: '🏥', color: '#06b6d4' },
    { name: 'Shopping', icon: '🛍️', color: '#a855f7' },
    { name: 'Education', icon: '📚', color: '#6366f1' },
    { name: 'Travel', icon: '✈️', color: '#0ea5e9' }
];

async function main() {
    for (const category of defaultCategories) {
        const existing = await prisma.category.findFirst({
            where: {
                userId: null,
                name: category.name
            }
        });

        if (existing) {
            await prisma.category.update({
                where: { id: existing.id },
                data: {
                    icon: category.icon,
                    color: category.color,
                    isDefault: true,
                    deletedAt: null
                }
            });
        } else {
            await prisma.category.create({
                data: {
                    userId: null,
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    isDefault: true
                }
            });
        }
    }

    console.log('Default categories seeded successfully.');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });