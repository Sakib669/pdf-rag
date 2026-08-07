#!/bin/sh
echo "🚀 Starting server and worker..."
npm start &
npm run worker &
wait