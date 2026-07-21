import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8080';
const pages = ['/', '/chat', '/apps', '/library', '/settings', '/integrations', '/billing', '/marketing'];
const results = {};

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const consoleErrors = {};
const failedRequests = {};
let currentPage = 'login';
consoleErrors[currentPage] = [];
failedRequests[currentPage] = [];

page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors[currentPage] = consoleErrors[currentPage] || [];
    consoleErrors[currentPage].push(msg.text());
  }
});
page.on('requestfailed', req => {
  failedRequests[currentPage] = failedRequests[currentPage] || [];
  failedRequests[currentPage].push(req.url() + ' :: ' + (req.failure()?.errorText || ''));
});
page.on('response', resp => {
  if (resp.status() >= 400) {
    failedRequests[currentPage] = failedRequests[currentPage] || [];
    failedRequests[currentPage].push(resp.url() + ' :: HTTP ' + resp.status());
  }
});

// login
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/browser/audit/00-initial.png', fullPage: true });

let loginInfo = { attempted: false, success: false, notes: '' };
try {
  // try to find login form fields
  const emailSel = 'input[type="email"], input[name="email"]';
  const passSel = 'input[type="password"], input[name="password"]';
  await page.waitForSelector(emailSel, { timeout: 8000 });
  loginInfo.attempted = true;
  await page.fill(emailSel, 'support@megsyai.com');
  await page.fill(passSel, 'Shm8n11@');
  await page.screenshot({ path: '/tmp/browser/audit/00-login-form.png', fullPage: true });
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/browser/audit/00-after-login.png', fullPage: true });
  loginInfo.success = true;
  loginInfo.urlAfter = page.url();
} catch (e) {
  loginInfo.notes = 'خطأ أثناء تسجيل الدخول: ' + e.message;
  await page.screenshot({ path: '/tmp/browser/audit/00-login-error.png', fullPage: true }).catch(()=>{});
}

results.login = loginInfo;

for (const path of pages) {
  currentPage = path === '/' ? 'home' : path.replace(/\//g, '');
  consoleErrors[currentPage] = [];
  failedRequests[currentPage] = [];
  const entry = { path, screenshot: null, loadTimeMs: null, errors: [], notes: [] };
  try {
    const start = Date.now();
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // wait for network idle-ish
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(()=>{ entry.notes.push('لم يصل الشبكة لحالة الخمول خلال 15 ثانية (قد يوجد تحميل عالق أو اتصال مستمر)'); });
    const loadTime = Date.now() - start;
    entry.loadTimeMs = loadTime;
    await page.waitForTimeout(1500);

    // check for stuck loading spinners
    const spinnerCount = await page.locator('[class*="spinner" i], [class*="loading" i], [role="status"]').count().catch(()=>0);
    if (spinnerCount > 0) {
      const visibleSpinners = await page.locator('[class*="spinner" i], [class*="loading" i], [role="status"]').evaluateAll(els => els.filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
      }).length);
      if (visibleSpinners > 0) entry.notes.push(`تم رصد ${visibleSpinners} عنصر تحميل ظاهر (spinner/loading) بعد الانتظار`);
    }

    const shotPath = `/tmp/browser/audit/${currentPage}.png`;
    await page.screenshot({ path: shotPath, fullPage: true });
    entry.screenshot = shotPath;

    // try clicking buttons to detect broken dialogs (only sample first few visible buttons, non-destructive check: just count buttons)
    const buttonCount = await page.locator('button:visible').count().catch(()=>0);
    entry.buttonCount = buttonCount;

  } catch (e) {
    entry.notes.push('خطأ عند تحميل الصفحة: ' + e.message);
    try {
      const shotPath = `/tmp/browser/audit/${currentPage}-error.png`;
      await page.screenshot({ path: shotPath, fullPage: true });
      entry.screenshot = shotPath;
    } catch {}
  }
  entry.consoleErrors = consoleErrors[currentPage];
  entry.failedRequests = failedRequests[currentPage];
  results[currentPage] = entry;
}

await browser.close();
fs.writeFileSync('/tmp/browser/audit/report.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
