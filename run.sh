#!/usr/bin/env bash
# ==============================================================================
# MindfulAI Unified Project Runner
# ==============================================================================
# This script:
# 1. Releases ports 3000 (Next.js) & 8000 (FastAPI) if occupied.
# 2. Clears stale Next.js cache (.next) to prevent runtime webpack crashes.
# 3. Launches the FastAPI backend uvicorn service.
# 4. Launches the Next.js frontend development server.
# ==============================================================================

# ANSI Color Codes
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}=== Starting MindfulAI Services ===${RESET}"

# 1. Stop conflicting services on ports
echo -e "${BLUE}[1/4] Releasing occupied ports (3000, 8000)...${RESET}"
PID_3000=$(lsof -t -i:3000)
if [ -n "$PID_3000" ]; then
  echo -e "${RED}Killing existing service on port 3000 (PID: $PID_3000)...${RESET}"
  kill -9 $PID_3000
fi

PID_8000=$(lsof -t -i:8000)
if [ -n "$PID_8000" ]; then
  echo -e "${RED}Killing existing service on port 8000 (PID: $PID_8000)...${RESET}"
  kill -9 $PID_8000
fi

# 2. Clear Next.js cache
echo -e "${BLUE}[2/4] Clearing stale Next.js development cache...${RESET}"
if [ -d "frontend/.next" ]; then
  rm -rf frontend/.next
  echo -e "${GREEN}✓ Stale .next cache removed successfully.${RESET}"
else
  echo -e "${GREEN}✓ No stale cache detected.${RESET}"
fi

# 3. Boot FastAPI backend
echo -e "${BLUE}[3/4] Starting FastAPI backend service...${RESET}"
cd backend
./mindfulai-env/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend service started in background (PID: $BACKEND_PID, logs: backend.log).${RESET}"

# 4. Boot Next.js dev server
echo -e "${BLUE}[4/4] Launching Next.js frontend dev server...${RESET}"
cd frontend
npm run dev
