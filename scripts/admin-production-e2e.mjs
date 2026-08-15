import { chromium } from "@playwright/test";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

if (!baseUrl || !email || !password) {
  throw new Error("E2E_BASE_URL, E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required");
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  console.log(`E2E_BASE_URL=${baseUrl}`);

  await page.goto(`${baseUrl}/auth`, { waitUntil: "domcontentloaded" });
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await page.waitForURL(
    (url) => url.pathname === "/admin" || url.pathname.startsWith("/admin/"),
    { timeout: 30000 },
  );

  await page.waitForLoadState("networkidle");
  await page.getByText("BA Medical", { exact: true }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  console.log("AUTH_ADMIN=PASS");

  await page.goto(`${baseUrl}/admin/catalog`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Activation catalogue" }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.getByText("Supabase authority", { exact: false }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.getByText("File d’activation retail", { exact: false }).waitFor({
    state: "visible",
    timeout: 15000,
  });

  const rows = await page.locator("text=Motif:").count();
  console.log(`ADMIN_CATALOG_ROWS=${rows}`);
  console.log("ADMIN_REPOSITORY_READ=PASS");
  console.log("PRODUCTION_ADMIN_AUTH_SMOKE=PASS");
} catch (error) {
  await page
    .screenshot({ path: "admin-production-e2e-failure.png", fullPage: true })
    .catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
