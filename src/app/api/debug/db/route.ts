import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userCount = await prisma.rcc.count();
        return NextResponse.json({ status: 'ok', userCount });
    } catch (error) {
        console.error('DB Connection Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
