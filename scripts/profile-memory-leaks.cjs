
/**
 * Memory Leak Detection Script
 * Monitors Vite dev server memory usage and generates reports
 */

const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { performance } = require('perf_hooks');

const samples = [];
let startTime = performance.now();

console.log('🔍 Starting memory leak profiler...\n');
console.log('This will run the dev server and track memory usage every 5 seconds');
console.log('Auto-stopping after 30 seconds to generate report\n');

// Start Vite with heap exposure
const vite = spawn('node', [
  '--expose-gc',
  '--max-old-space-size=4096',
  './node_modules/vite/bin/vite.js',
  '--host',
  '0.0.0.0'
], {
  stdio: 'inherit'
});

// Auto-stop after 30 seconds
setTimeout(() => {
  console.log('\n⏱️  30 seconds elapsed, stopping profiler...');
  process.emit('SIGINT');
}, 30000);

// Sample memory every 5 seconds
const interval = setInterval(() => {
  if (global.gc) {
    global.gc(); // Force GC before measuring
  }
  
  const mem = process.memoryUsage();
  const sample = {
    timestamp: Math.round((performance.now() - startTime) / 1000),
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    external: Math.round(mem.external / 1024 / 1024),
    rss: Math.round(mem.rss / 1024 / 1024)
  };
  
  samples.push(sample);
  
  console.log(`[${sample.timestamp}s] Heap: ${sample.heapUsed}/${sample.heapTotal} MB | RSS: ${sample.rss} MB | External: ${sample.external} MB`);
  
  // Check for leak pattern
  if (samples.length >= 10) {
    const recent = samples.slice(-10);
    const avgGrowth = (recent[9].heapUsed - recent[0].heapUsed) / 9;
    
    if (avgGrowth > 5) {
      console.warn(`⚠️  LEAK DETECTED: Heap growing at ${avgGrowth.toFixed(2)} MB/sample`);
    }
  }
}, 5000);

// Generate report on exit
process.on('SIGINT', () => {
  clearInterval(interval);
  vite.kill();
  
  console.log('\n\n📊 Generating memory report...\n');
  
  const report = {
    duration: Math.round((performance.now() - startTime) / 1000),
    samples: samples.length,
    initialHeap: samples[0]?.heapUsed || 0,
    finalHeap: samples[samples.length - 1]?.heapUsed || 0,
    peakHeap: Math.max(...samples.map(s => s.heapUsed)),
    averageGrowth: samples.length > 1 
      ? ((samples[samples.length - 1].heapUsed - samples[0].heapUsed) / samples.length).toFixed(2)
      : 0,
    samples
  };
  
  console.log(`Duration: ${report.duration}s`);
  console.log(`Initial Heap: ${report.initialHeap} MB`);
  console.log(`Final Heap: ${report.finalHeap} MB`);
  console.log(`Peak Heap: ${report.peakHeap} MB`);
  console.log(`Growth Rate: ${report.averageGrowth} MB/sample`);
  console.log(`Total Growth: ${report.finalHeap - report.initialHeap} MB`);
  
  writeFileSync('memory-leak-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Report saved to memory-leak-report.json');
  
  process.exit(0);
});

vite.on('error', (err) => {
  console.error('❌ Vite error:', err);
  process.exit(1);
});
