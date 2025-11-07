#!/bin/bash
set -e

echo "=== Running end-to-end test ==="

# 1. Check textures
if [ ! -d "public/textures" ]; then
  echo "Setting up textures..."
  pnpm setup:textures
fi

# 2. Run unit tests
echo "Running unit tests..."
pnpm test

# 3. Build
echo "Building..."
pnpm build

echo "=== End-to-end test complete ==="
