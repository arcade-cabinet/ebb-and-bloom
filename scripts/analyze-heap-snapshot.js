
#!/usr/bin/env node

/**
 * Heap Snapshot Analyzer
 * Takes heap snapshots and compares them to find leaks
 */

import v8 from 'v8';
import { writeFileSync } from 'fs';

console.log('📸 Taking initial heap snapshot...');
const snapshot1 = v8.writeHeapSnapshot('./heap-snapshot-1.heapsnapshot');
console.log(`✅ Saved: ${snapshot1}`);

console.log('\n⏳ Waiting 30 seconds for activity...');
console.log('   (Interact with the app to trigger potential leaks)\n');

setTimeout(() => {
  if (global.gc) global.gc();
  
  console.log('📸 Taking second heap snapshot...');
  const snapshot2 = v8.writeHeapSnapshot('./heap-snapshot-2.heapsnapshot');
  console.log(`✅ Saved: ${snapshot2}`);
  
  console.log('\n📊 To analyze:');
  console.log('   1. Open Chrome DevTools');
  console.log('   2. Go to Memory tab');
  console.log(`   3. Load ${snapshot1}`);
  console.log(`   4. Load ${snapshot2}`);
  console.log('   5. Compare snapshots to see what grew');
  
  process.exit(0);
}, 30000);
