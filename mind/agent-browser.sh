#!/usr/bin/env bash
# Wrapper for agent-browser with the correct environment.
# Source this in your shell to set up, or prefix commands with it.
# Usage:
#   ./agent-browser.sh open http://localhost:5173/
#   ./agent-browser.sh click @e4
#   ./agent-browser.sh screenshot output.png

export DISPLAY=:99
CHROME=/home/grexdin/.agent-browser/browsers/chrome-149.0.7827.22/chrome

# Start Xvfb if not running
if ! pgrep -x Xvfb > /dev/null 2>&1; then
  Xvfb :99 -screen 0 1920x1080x24 &
  sleep 1
fi

# Open page if first command is 'open' (needs special handling)
if [ "$1" = "open" ]; then
  shift
  exec agent-browser open "$@" \
    --executable-path "$CHROME" \
    -- \
    --no-sandbox --disable-gpu
fi

exec agent-browser "$@"
