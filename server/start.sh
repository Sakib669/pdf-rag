#!/bin/sh

# Start Valkey in the background
echo "⏳ Starting Valkey..."
valkey-server --appendonly yes --bind 0.0.0.0 &

# Wait for Valkey to be ready
echo "⏳ Waiting for Valkey to be ready..."
while ! valkey-cli ping > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Valkey is ready"

# Start Express server (in the background)
echo "⏳ Starting Express server..."
npm start &

# Start the worker (in the background)
echo "⏳ Starting BullMQ worker..."
npm run worker &

# Wait for all background processes
wait