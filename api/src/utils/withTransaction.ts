import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export async function withTransaction<T>(
    tx: Prisma.TransactionClient | undefined,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
    if (tx) return fn(tx);
    
    return prisma.$transaction(fn);
}
