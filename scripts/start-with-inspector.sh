
#!/bin/bash

echo "🔍 Starting Vite with Node.js Inspector (Chrome DevTools)"
echo ""
echo "1. Open Chrome/Edge to: chrome://inspect"
echo "2. Click 'Open dedicated DevTools for Node'"
echo "3. Go to Memory tab"
echo "4. Take heap snapshots before/after interactions"
echo ""

cd game && node --inspect --expose-gc ../node_modules/vite/bin/vite.js --host
