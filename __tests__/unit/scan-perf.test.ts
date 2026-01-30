
import { describe, it, expect, vi } from 'vitest';

// Mock simulation of the Database delays
const DB_DELAY_MS = 100;

// Helper to simulate a DB operation
const mockDbOp = async () => {
  await new Promise(resolve => setTimeout(resolve, DB_DELAY_MS));
  return { error: null };
};

// Mock Supabase Client
const mockSupabase = {
  from: () => ({
    update: () => ({
      eq: mockDbOp
    })
  })
};

describe('Scan API Performance Benchmark', () => {

  it('measures SERIAL execution (Baseline)', async () => {
    const start = performance.now();

    // Simulating Step 5: Update scan record
    await mockSupabase.from().update().eq();

    // Simulating Step 6: Update website last_scan_at
    await mockSupabase.from().update().eq();

    const end = performance.now();
    const duration = end - start;

    console.log(`\nSERIAL Execution Time: ${duration.toFixed(2)}ms`);

    // Should be at least 2 * DELAY (allowing for slight timer variance)
    expect(duration).toBeGreaterThanOrEqual(DB_DELAY_MS * 1.9);
  });

  it('measures PARALLEL execution (Optimized)', async () => {
    const start = performance.now();

    // Simulating Parallel Execution
    await Promise.all([
        mockSupabase.from().update().eq(),
        mockSupabase.from().update().eq()
    ]);

    const end = performance.now();
    const duration = end - start;

    console.log(`PARALLEL Execution Time: ${duration.toFixed(2)}ms\n`);

    // Should be roughly 1 * DELAY (plus overhead), but definitely less than 2 * DELAY
    expect(duration).toBeLessThan(DB_DELAY_MS * 1.9);
    // Allow small variance (e.g. 99ms instead of 100ms due to timer resolution)
    expect(duration).toBeGreaterThanOrEqual(DB_DELAY_MS - 10);
  });
});
