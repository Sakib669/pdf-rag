#!/usr/bin/env bash
set -e

# Start Valkey/Redis in the background.
redis-server --save "" --appendonly no &
REDIS_PID=$!

# Wait for Redis to be ready.
for i in {1..20}; do
  if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
    break
  fi
  echo "Waiting for Redis to start... ($i/20)"
  sleep 1
done

if ! redis-cli ping > /dev/null 2>&1; then
  echo "❌ Redis did not start in time"
  kill $REDIS_PID
  exit 1
fi

# Start the Express API and worker in the background.
npm start &
API_PID=$!
npm run worker &
WORKER_PID=$!

# Wait for any process to exit and propagate its status.
wait -n $REDIS_PID $API_PID $WORKER_PID
EXIT_CODE=$?

echo "One of the processes exited with code $EXIT_CODE"
kill $REDIS_PID $API_PID $WORKER_PID 2>/dev/null || true
exit $EXIT_CODE
