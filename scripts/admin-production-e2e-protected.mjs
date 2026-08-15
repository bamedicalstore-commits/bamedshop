import { chromium } from "@playwright/test";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

if (!baseUrl || !email || !password || !vercelBypassSecret) {
  throw new Error(
    "E2E_BASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD and VERCEL_AUTOMATION_BYPASS_SECRET are required",
  );
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  extraHTTPHeaders: {
    "x-vercel-protection-bypass": vercelBypassSecret,
    "x-vercel-set-bypass-cookie": "samesitenone",
  },
});
const page = await context.newPage();

try {
  console.log(`E2E_BASE_URL=${baseUrl}`);
  console.log("VERCEL_PROTECTION_BYPASS=AVAILABLE");

  const bootstrapUrl = new URL(`${baseUrl}/auth`);
  bootstrapUrl.searchParams.set("x-vercel-protection-bypass", vercelBypassSecret);
  bootstrapUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");

  await page.goto(bootstrapUrl.toString(), { waitUntil: "domcontentloaded" });
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);

  const submitButton = page.getByRole("button", { name: "Se connecter" });
  await submitButton.waitFor({ state: "visible", timeout: 15000 });
  await submitButton.click({ force: true });

  await page.waitForURL((url) => url.pathname === "/admin" || url.pathname.startsWith("/admin/"), {
    timeout: 30000,
  });

  await page.waitForLoadState("networkidle");
  await page.getByText("BA Medical", { exact: true }).waitFor({ state: "visible", timeout: 15000 });
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
  await page.screenshot({ path: "admin-production-e2e-failure.png", fullPage: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
