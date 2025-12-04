import { PrismaClient } from '../src/generated/prisma';

// Configure connection pool size from environment or use defaults
const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10');
const connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration via DATABASE_URL query params
  // Example: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
});

export default prisma;
