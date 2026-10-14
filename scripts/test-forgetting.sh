#!/usr/bin/env bash
set -e

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-http://localhost:5001}"
TIMESTAMP=$(date +%s)
TEST_NAME="Forgetting Test User ${TIMESTAMP}"
TEST_EMAIL="forgetting_${TIMESTAMP}@test.edu"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}        THE FORGETTING TEST (PERSISTENCE TEST)        ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Step 1: Ensure services are up
echo -e "\n${YELLOW}[Step 1/4] Ensuring Docker Compose services are running...${NC}"
docker compose up -d

echo "Waiting for backend API (${API_URL}/api/health)..."
for i in {1..30}; do
  if curl -s -f "${API_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy!${NC}"
    break
  fi
  sleep 1
done

# Step 2: Create a record
echo -e "\n${YELLOW}[Step 2/4] Creating a new record via API...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${TEST_NAME}\",\"email\":\"${TEST_EMAIL}\",\"role\":\"ALUMNI\",\"department\":\"Software Verification\"}")

echo "Response: ${CREATE_RESPONSE}"
RECORD_ID=$(echo "${CREATE_RESPONSE}" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ -z "${RECORD_ID}" ]; then
  echo -e "${RED}✗ Failed to create record or extract record ID!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Record created successfully with ID: ${RECORD_ID}${NC}"

# Step 3: Docker compose down, then up
echo -e "\n${YELLOW}[Step 3/4] Running docker compose down...${NC}"
docker compose down

echo -e "\n${YELLOW}Running docker compose up -d...${NC}"
docker compose up -d

echo "Waiting for services to recover..."
for i in {1..30}; do
  if curl -s -f "${API_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is back online!${NC}"
    break
  fi
  sleep 1
done

# Step 4: Check the record
echo -e "\n${YELLOW}[Step 4/4] Checking if record ${RECORD_ID} survived the restart...${NC}"
CHECK_RESPONSE=$(curl -s "${API_URL}/api/user/${RECORD_ID}")
echo "Response: ${CHECK_RESPONSE}"

if echo "${CHECK_RESPONSE}" | grep -q "${TEST_EMAIL}"; then
  echo -e "\n${GREEN}======================================================${NC}"
  echo -e "${GREEN}✓ SUCCESS: THE FORGETTING TEST PASSED!${NC}"
  echo -e "${GREEN}  Record #${RECORD_ID} (${TEST_NAME}) persisted across compose down/up.${NC}"
  echo -e "${GREEN}======================================================${NC}"
  exit 0
else
  echo -e "\n${RED}======================================================${NC}"
  echo -e "${RED}✗ FAILURE: THE FORGETTING TEST FAILED!${NC}"
  echo -e "${RED}  The record was forgotten after compose down/up.${NC}"
  echo -e "${RED}======================================================${NC}"
  exit 1
fi
