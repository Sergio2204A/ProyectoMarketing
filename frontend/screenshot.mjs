import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// --- LOGIN PAGE ---
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: 'C:/Users/Sergio.Abril/ProyectoMarketing/ss-01-login.png' });
console.log('1: login captured');

// --- LOG IN ---
await page.fill('input[type="email"]', 'test@test.com');
await page.fill('input[type="password"]', '123456');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'C:/Users/Sergio.Abril/ProyectoMarketing/ss-02-dashboard.png' });
console.log('2: dashboard captured - title: ' + await page.title());

// --- SIDEBAR visible? ---
const sidebar = await page.$('.sidebar');
console.log('sidebar present:', !!sidebar);
const logo = await page.$('.sidebar-logo-img');
console.log('logo img present:', !!logo);
const header = await page.$('.top-header');
console.log('top-header present:', !!header);
const metrics = await page.$$('.metric-card');
console.log('metric cards count:', metrics.length);

// --- NAVIGATE: Campaign ---
const campLink = await page.$('a[href="#campaign"]');
if (campLink) { await campLink.click(); await page.waitForTimeout(800); }
await page.screenshot({ path: 'C:/Users/Sergio.Abril/ProyectoMarketing/ss-03-campaign.png' });
console.log('3: campaign tab captured');

// --- NAVIGATE: History ---
const histLink = await page.$('a[href="#history"]');
if (histLink) { await histLink.click(); await page.waitForTimeout(800); }
await page.screenshot({ path: 'C:/Users/Sergio.Abril/ProyectoMarketing/ss-04-history.png' });
console.log('4: history tab captured');

await browser.close();
console.log('DONE');
