import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}       
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})
export const prisma = globalThis.__prismaClient__ ?? (globalThis.__prismaClient__ = new PrismaClient({ adapter }));

