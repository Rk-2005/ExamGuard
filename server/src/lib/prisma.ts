import { PrismaClient } from '../src/generated/prisma';

// Connection pool configuration is done via DATABASE_URL query parameters
// Example: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
// The environment variables below are for documentation purposes

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
