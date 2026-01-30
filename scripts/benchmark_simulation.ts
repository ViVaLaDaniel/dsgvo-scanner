
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mockFetchProfile() {
  await sleep(100); // Simulate 100ms DB latency
  return { data: { website_limit: 10 } };
}

async function mockFetchCount() {
  await sleep(100); // Simulate 100ms DB latency
  return { count: 5 };
}

async function mockFetchScans() {
  await sleep(150); // Simulate 150ms DB latency (slightly heavier query)
  return { data: [] };
}

async function runSequential() {
  console.log('--- Sequential Execution ---');
  const start = performance.now();

  await mockFetchProfile();
  await mockFetchCount();
  await mockFetchScans();

  const end = performance.now();
  console.log(`Total Time: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function runParallel() {
  console.log('--- Parallel Execution (Promise.all) ---');
  const start = performance.now();

  await Promise.all([
    mockFetchProfile(),
    mockFetchCount(),
    mockFetchScans()
  ]);

  const end = performance.now();
  console.log(`Total Time: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function main() {
  console.log('Starting Benchmark Simulation...\n');

  const sequentialTime = await runSequential();
  console.log('');
  const parallelTime = await runParallel();

  console.log('\n--- Results ---');
  console.log(`Improvement: ${(sequentialTime - parallelTime).toFixed(2)}ms saved`);
  console.log(`Speedup: ${(sequentialTime / parallelTime).toFixed(1)}x faster`);
}

main();
