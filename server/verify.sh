#!/bin/bash

echo "=== ExamGuard Server Verification Script ==="
echo ""

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is NOT set"
    echo "   The server will not start without this variable."
    echo "   Set it with: export JWT_SECRET=your-secret-key"
else
    echo "✓ JWT_SECRET is set"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable is NOT set"
    echo "   Set it with: export DATABASE_URL='postgresql://user:pass@host:5432/db'"
else
    echo "✓ DATABASE_URL is set"
fi

echo ""
echo "=== Checking Dependencies ==="

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ node_modules directory exists"
else
    echo "❌ node_modules directory not found. Run: npm install"
fi

# Check if dist exists
if [ -d "dist" ]; then
    echo "✓ dist directory exists (built)"
else
    echo "❌ dist directory not found. Run: npm run build"
fi

echo ""
echo "=== Key Files Check ==="

files=(
    "dist/index.js"
    "dist/cluster.js"
    "dist/lib/prisma.js"
    "dist/middleware/rate-limit.middleware.js"
    "dist/validators/auth.validator.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "❌ $file not found"
    fi
done

echo ""
echo "=== Available Scripts ==="
echo "npm run dev           - Development mode with hot reload"
echo "npm run build         - Build TypeScript to JavaScript"
echo "npm start             - Run production server (single process)"
echo "npm run start:cluster - Run production server (cluster mode)"

echo ""
echo "=== Next Steps ==="
echo "1. Ensure JWT_SECRET and DATABASE_URL are set in your .env file"
echo "2. Run: npm run build"
echo "3. Run: npm start (or npm run start:cluster for cluster mode)"
