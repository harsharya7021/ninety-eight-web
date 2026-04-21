#!/usr/bin/env bash
# NINETY-EIGHT · v2 · local launcher
# Starts a tiny HTTP server in this folder and opens the page.
cd "$(dirname "$0")"
PORT=8098
echo "Serving 98 · v2 on http://localhost:$PORT"
# Open browser after a brief delay so the server is listening
( sleep 1 && (open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) ) &
python3 -m http.server "$PORT"
