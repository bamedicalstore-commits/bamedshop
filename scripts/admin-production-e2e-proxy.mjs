import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import https from "node:https";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const supabaseHost = process.env.E2E_SUPABASE_HOST;

if (!baseUrl || !email || !password || !bypass || !supabaseHost) {
  throw new Error("Missing required E2E environment variables");
}

function resolveSupabaseHost() {
  const result = execFileSync("getent", ["ahostsv4", supabaseHost], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .trim()
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
  if (result[0]) return result[0];
  throw new Error(`Unable to resolve ${supabaseHost}`);
}

const supabaseIp = resolveSupabaseHost();
console.log(`E2E_SUPABASE_DNS=${supabaseHost} -> ${supabaseIp}`);

function proxySupabaseRequest(request) {
  return new Promise((resolve, reject) => {
    const url = new URL(request.url());
    const headers = { ...request.headers() };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];
    delete headers["accept-encoding"];
    headers.host = supabaseHost;
    headers["accept-encoding"] = "identity";

    const upstream = https.request(
      {
        hostname: supabaseIp,
        port: 443,
        method: request.method(),
        path: `${url.pathname}${url.search}`,
        headers,
        servername: supabaseHost,
        rejectUnauthorized: true,
      },
      (response) => {
        const responseHeaders = { ...response.headers };
        delete responseHeaders.connection;
        delete responseHeaders["transfer-encoding"];
        delete responseHeaders["content-encoding"];
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({
            status: response.statusCode ?? 502,
            headers: responseHeaders,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    upstream.on("error", reject);
    const body = request.postDataBuffer();
    if (body) upstream.write(body);
    upstream.end();
  });
}

const browser = await chromium.launch({
  headless: true,
  args: [`--host-resolver-rules=MAP ${supabaseHost} ${supabaseIp}`],
});
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const baseOrigin = new URL(baseUrl).origin;
const supabaseOrigin = `https://${supabaseHost}`;

await page.route(`https://${supabaseHost}/**`, async (route) => {
  const request = route.request();
  const url = request.url();
  console.log(`E2E_SUPABASE_ROUTE=${request.method()} ${url}`);
  try {
    await route.fulfill(await proxySupabaseRequest(request));
  } catch (error) {
    console.error(
      `E2E_SUPABASE_PROXY_ERROR=${error instanceof Error ? error.message : String(error)}`,
    );
    await route.abort("failed");
  }
});

await context.route("**/*", async (route) => {
  const origin = new URL(route.request().url()).origin;
  if (origin === supabaseOrigin) return route.fallback();
  const headers = { ...route.request().headers() };
  if (origin !== baseOrigin) {
    delete headers["x-vercel-protection-bypass"];
    delete headers["x-vercel-set-bypass-cookie"];
  }
  await route.continue({ headers });
});

page.on("requestfailed", (request) => {
  if (request.url().includes("supabase")) {
    console.error(
      `E2E_REQUEST_FAILED=${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`,
    );
  }
});

page.on("response", async (response) => {
  if (response.url().includes("/auth/v1/token")) {
    console.log(`E2E_AUTH_HTTP=${response.status()}`);
    if (response.status() >= 400) {
      console.error(`E2E_AUTH_HTTP_BODY=${(await response.text().catch(() => "")).slice(0, 1000)}`);
    }
  }
});

try {
  console.log(`E2E_BASE_URL=${baseUrl}`);
  const authUrl = new URL(`${baseUrl}/auth`);
  authUrl.searchParams.set("x-vercel-protection-bypass", bypass);
  authUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");
  await page.goto(authUrl.toString(), { waitUntil: "domcontentloaded" });

  await page.locator("#login-email").waitFor({ state: "visible", timeout: 15000 });
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  console.log("E2E_LOGIN_FORM_READY=YES");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click({ force: true });

  await page.waitForFunction(
    () =>
      window.location.pathname === "/admin" ||
      window.location.pathname.startsWith("/admin/") ||
      Boolean(document.querySelector('[role="alert"]')),
    undefined,
    { timeout: 20000 },
  );

  const alert = await page
    .locator('[role="alert"]')
    .first()
    .textContent()
    .catch(() => null);
  if (alert) throw new Error(`Supabase login rejected: ${alert.trim()}`);

  console.log(`E2E_POST_LOGIN_URL=${page.url()}`);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  console.log(
    `E2E_SUPABASE_STORAGE_KEYS=${keys.filter((key) => key.includes("auth-token")).join(",") || "NONE"}`,
  );

  await page.waitForURL((url) => url.pathname === "/admin" || url.pathname.startsWith("/admin/"), {
    timeout: 15000,
  });
  await page.getByText("BA Medical", { exact: true }).waitFor({ state: "visible", timeout: 15000 });
  console.log("AUTH_ADMIN=PASS");

  await page.goto(`${baseUrl}/admin/catalog`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Activation catalogue" })
    .waitFor({ state: "visible", timeout: 15000 });
  await page
    .getByText("Supabase authority", { exact: false })
    .waitFor({ state: "visible", timeout: 15000 });
  await page
    .getByText("File d’activation retail", { exact: false })
    .waitFor({ state: "visible", timeout: 15000 });
  const rows = await page.locator("text=Motif:").count();
  console.log(`ADMIN_CATALOG_ROWS=${rows}`);
  console.log("ADMIN_REPOSITORY_READ=PASS");
  console.log("PRODUCTION_ADMIN_AUTH_SMOKE=PASS");
} catch (error) {
  console.error(`E2E_CURRENT_URL=${page.url()}`);
  console.error(`E2E_PAGE_TITLE=${await page.title().catch(() => "<unavailable>")}`);
  const alert = await page
    .locator('[role="alert"]')
    .first()
    .textContent()
    .catch(() => null);
  if (alert) console.error(`E2E_AUTH_ERROR=${alert.trim()}`);
  console.error(error);
  await page
    .screenshot({ path: "admin-production-e2e-failure.png", fullPage: true })
    .catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
