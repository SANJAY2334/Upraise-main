/**
 * UPRISE Load Testing Suite
 * Uses autocannon to benchmark API endpoint throughput and latency.
 *
 * Usage:
 *   node tests/load/autocannon.js [target_url]
 *
 * Prerequisites:
 *   - Server must be running (npm run dev or docker-compose up)
 *   - Set TARGET_URL env or pass as arg (default: http://localhost:4000)
 */

import autocannon from "autocannon";
import { promisify } from "util";

const run = promisify(autocannon);

const TARGET = process.argv[2] ?? process.env.TARGET_URL ?? "http://localhost:4000";

async function benchmark(name, opts) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  Running: ${name}`);
  console.log(`  URL: ${opts.url}`);
  console.log(`${"─".repeat(60)}`);

  const result = await run({ duration: 10, connections: 10, pipelining: 1, ...opts });

  console.log(`  Requests/sec : ${result.requests.average}`);
  console.log(`  Latency avg  : ${result.latency.average} ms`);
  console.log(`  Latency p99  : ${result.latency.p99} ms`);
  console.log(`  Throughput   : ${(result.throughput.average / 1024).toFixed(2)} KB/s`);
  console.log(`  Errors       : ${result.errors}`);
  console.log(`  Non-2xx      : ${result.non2xx}`);

  return result;
}

async function main() {
  console.log(`\nUPRISE Load Testing Suite`);
  console.log(`Target: ${TARGET}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const results = [];

  // 1. Healthz liveness probe
  results.push(
    await benchmark("GET /healthz — Liveness Probe", {
      url: `${TARGET}/healthz`,
      method: "GET"
    })
  );

  // 2. Public content endpoint
  results.push(
    await benchmark("GET /api/content/public — Public CMS Content", {
      url: `${TARGET}/api/content/public`,
      method: "GET"
    })
  );

  // 3. CSRF token endpoint
  results.push(
    await benchmark("GET /api/csrf — CSRF Token Fetch", {
      url: `${TARGET}/api/csrf`,
      method: "GET"
    })
  );

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log("LOAD TEST SUMMARY");
  console.log(`${"═".repeat(60)}`);

  for (const [i, r] of results.entries()) {
    const errRate = ((r.errors + r.non2xx) / (r.requests.total || 1)) * 100;
    const status = errRate < 1 ? "✅ PASS" : "❌ FAIL";
    console.log(
      `  [${i + 1}] ${status}  req/s: ${r.requests.average}  p99: ${r.latency.p99}ms  errors: ${errRate.toFixed(1)}%`
    );
  }

  console.log(`\nFinished: ${new Date().toISOString()}`);

  // Exit non-zero if any test had >1% errors
  const hasFailures = results.some((r) => (r.errors + r.non2xx) / (r.requests.total || 1) > 0.01);
  process.exit(hasFailures ? 1 : 0);
}

main().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
