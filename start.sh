#!/bin/bash

# Start LocalAI in background
cd /usr/local/bin/localai
./local-ai --config-file models.yaml --address 0.0.0.0:8080 &

# Wait for LocalAI to start
sleep 10

# Start Node.js application
cd /app
npm start