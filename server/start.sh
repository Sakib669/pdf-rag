#!/bin/sh
# Start server and worker together

npm start &
npm run worker &

# Wait for any to exit
wait