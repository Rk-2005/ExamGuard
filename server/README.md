# ExamGuard Server

## Scalability and Security Improvements

This server now supports 500+ concurrent users with the following enhancements:

### Scalability Features

#### 1. **Cluster Mode**
- Utilizes all CPU cores for better performance
- Automatic worker restart on crash
- Run with: `npm run start:cluster`

#### 2. **Response Compression**
- Reduces bandwidth usage with gzip compression
- Automatically applied to all responses

#### 3. **Database Connection Pooling**
- Centralized Prisma client with connection pooling
- Configurable pool size via environment variables
- Reduces database connection overhead

#### 4. **Health Check Endpoint**
- Endpoint: `GET /health`
- Returns server status, uptime, and memory usage
- Useful for monitoring and load balancers

### Security Features

#### 1. **Secure JWT Configuration**
- **REQUIRED**: `JWT_SECRET` environment variable must be set
- No fallback to weak default values
- Server will not start without proper JWT_SECRET

#### 2. **Input Validation**
- All auth endpoints validate input using Zod schemas
- Email format validation
- Password length requirements (min 6 characters)
- Prevents malformed data from reaching the database

#### 3. **Rate Limiting**
- Auth endpoints protected with rate limiting
- Limit: 10 requests per 15 minutes per IP
- Prevents brute-force attacks

#### 4. **Security Headers**
- Helmet.js middleware for security headers
- Protection against common web vulnerabilities:
  - XSS attacks
  - Clickjacking
  - MIME sniffing
  - And more

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/examguard?connection_limit=10&pool_timeout=10"

# Database Connection Pool Configuration
DATABASE_CONNECTION_LIMIT=10
DATABASE_CONNECTION_TIMEOUT=10

# JWT Configuration (REQUIRED)
JWT_SECRET=your-secure-jwt-secret-here

# Server Configuration
PORT=3000
```

### Running the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode (Single Process)
```bash
npm run build
npm start
```

#### Production Mode (Cluster)
```bash
npm run build
npm run start:cluster
```

### Scripts

- `npm run dev` - Development mode with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server (single process)
- `npm run start:cluster` - Run production server (cluster mode)

### Architecture Changes

#### Centralized Prisma Client
All controllers now use a shared Prisma client instance from `src/lib/prisma.ts` to ensure proper connection pooling.

#### Input Validation
Validation schemas are defined in `src/validators/` and used in controllers to validate incoming requests.

#### Rate Limiting Middleware
Rate limiting is configured in `src/middleware/rate-limit.middleware.ts` and applied to auth routes.
