#!/bin/sh
set -e

# Fix permissions on Railway volume mount (mounted as root, app runs as nextjs)
if [ -d /app/uploads ]; then
  chown -R nextjs:nodejs /app/uploads 2>/dev/null || true
fi

# Drop privileges and run the app as nextjs
exec su-exec nextjs node server.js
