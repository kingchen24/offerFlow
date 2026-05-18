const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '_debug-page.png', fullPage: false });
  console.log('screenshot saved');

  // Also test if margin/padding works with direct style
  const test = await page.evaluate(() => {
    // Test a batch of Tailwind classes on known elements
    const checkEl = (label, el) => {
      if (!el) return { label, error: 'element not found' };
      const cs = getComputedStyle(el);
      return {
        label,
        marginLeft: cs.marginLeft,
        marginRight: cs.marginRight,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        className: el.className
      };
    };

    const navHeader = document.querySelector('header');
    const mainEl = document.querySelector('main');

    return [
      checkEl('header', navHeader),
      checkEl('main', mainEl)
    ];
  });
  console.log(JSON.stringify(test, null, 2));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });