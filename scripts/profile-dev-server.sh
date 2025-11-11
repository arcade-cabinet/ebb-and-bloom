
#!/bin/bash

echo "🔍 Starting Vite dev server with Node.js profiling..."
echo ""
echo "Memory snapshots will be saved to ./memory-profiles/"
mkdir -p memory-profiles

# Run with heap profiling
NODE_OPTIONS="--max-old-space-size=4096 --expose-gc --trace-gc --trace-gc-verbose --heap-prof --heap-prof-interval=10000000" \
  npm run dev

echo ""
echo "✅ Heap profiles saved to memory-profiles/"
echo "Analyze with: node --prof-process isolate-*-heap.heapprofile"
