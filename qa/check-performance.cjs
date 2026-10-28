/* Stable payload/layout guardrails; real LCP is measured on Vercel at release. */
const { spawn, spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('@playwright/test');

(async () => {
  const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4178';
  const server = process.env.PORTFOLIO_URL ? null : spawn('python3', ['-m', 'http.server', '4178', '--bind', '127.0.0.1', '--directory', '..'], { stdio: 'ignore' });
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      try { if ((await fetch(base)).ok) break; } catch {}
      if (attempt === 39) throw new Error('Audit server did not become ready');
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    mkdirSync('performance-report', { recursive: true });
    for (const [name, hash] of [['home', ''], ['paige', '#project/paige'], ['resource', '#project/resource-workshop']]) {
      const output = join('performance-report', name);
      const run = spawnSync(process.execPath, [require.resolve('lighthouse/cli/index.js'), base + '/' + hash,
        '--chrome-flags=--headless --no-sandbox', '--output=json', '--output=html', '--quiet', '--output-path=' + output],
        { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromium.executablePath() }, timeout: 120000 });
      if (run.status !== 0) throw new Error(`Lighthouse failed: ${name}`);
      const report = JSON.parse(readFileSync(output + '.report.json'));
      if (report.runtimeError) throw new Error(report.runtimeError.message);
      const bytes = report.audits['total-byte-weight'].numericValue;
      const cls = report.audits['cumulative-layout-shift'].numericValue;
      console.log(`${name}: ${bytes} bytes; CLS ${cls}; LCP ${Math.round(report.audits['largest-contentful-paint'].numericValue)} ms (lab)`);
      if (bytes > 3 * 1024 * 1024 || cls >= .1) throw new Error(`${name} exceeds payload/layout budget`);
      for (const category of ['accessibility', 'best-practices', 'seo']) {
        if (report.categories[category].score < 1) throw new Error(`${name}: ${category} needs review`);
      }
    }
  } finally { server?.kill(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
