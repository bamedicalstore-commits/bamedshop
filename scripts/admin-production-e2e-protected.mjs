import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import https from "node:https";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const supabaseHost = process.env.E2E_SUPABASE_HOST;

if (!baseUrl || !email || !password || !vercelBypassSecret || !supabaseHost) {
  throw new Error(
    "E2E_BASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, VERCEL_AUTOMATION_BYPASS_SECRET and E2E_SUPABASE_HOST are required",
  );
}

function resolveSupabaseHost() {
  try {
    const addresses = execFileSync("getent", ["ahostsv4", supabaseHost], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean);
    if (addresses.length > 0) return addresses[0];
  } catch {
    // Fall through to DNS-over-HTTPS when the runner resolver cannot resolve Supabase.
  }

  const queryUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(supabaseHost)}&type=A`;
  const raw = execFileSync(
    "curl",
    [
      "--silent",
      "--show-error",
      "--fail",
      "--max-time",
      "10",
      "--resolve",
      "cloudflare-dns.com:443:1.1.1.1",
      queryUrl,
      "-H",
      "accept: application/dns-json",
    ],
    { encoding: "utf8" },
  );
  const answers = JSON.parse(raw).Answer ?? [];
  const address = answers.find((answer) => answer.type === 1)?.data;
  if (!address) throw new Error(`Unable to resolve ${supabaseHost} through DNS-over-HTTPS.`);
  return address;
}

const supabaseIp = resolveSupabaseHost();
console.log(`E2E_SUPABASE_DNS=${supabaseHost} -> ${supabaseIp}`);

function proxySupabaseRequest(request) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(request.url());
    const incomingHeaders = { ...request.headers() };
    const headers = { ...incomingHeaders };

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
        path: `${requestUrl.pathname}${requestUrl.search}`,
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
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            headers: responseHeaders,
            body: Buffer.concat(chunks),
          });
        });
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
});
const context = await browser.newContext();
const page = await context.newPage();
const baseOrigin = new URL(baseUrl).origin;
const supabaseOrigin = `https://${supabaseHost}`;

await context.route("**/*", async (route) => {
  const requestUrl = route.request().url();
  const requestOrigin = new URL(requestUrl).origin;

  if (requestOrigin === supabaseOrigin) {
    try {
      const proxied = await proxySupabaseRequest(route.request());
      await route.fulfill(proxied);
    } catch (error) {
      console.error(`E2E_SUPABASE_PROXY_ERROR=${error instanceof Error ? error.message : String(error)}`);
      await route.abort("failed");
    }
    return;
  }

  const headers = { ...route.request().headers() };
  if (requestOrigin !== baseOrigin) {
    delete headers["x-vercel-protection-bypass"];
    delete headers["x-vercel-set-bypass-cookie"];
  }
  await route.continue({ headers });
});

page.on("pageerror", (error) => {
  console.error(`E2E_PAGE_ERROR=${error.message}`);
});

page.on("console", (message) => {
  if (message.type() === "error") console.error(`E2E_CONSOLE_ERROR=${message.text()}`);
});

page.on("requestfailed", (request) => {
  const url = request.url();
  if (url.includes("/auth/v1/") || url.includes("supabase")) {
    console.error(
      `E2E_REQUEST_FAILED=${request.method()} ${url} :: ${request.failure()?.errorText ?? "unknown"}`,
    );
  }
});

page.on("response", async (response) => {
  const url = response.url();
  if (url.includes("/auth/v1/token")) {
    console.log(`E2E_AUTH_HTTP=${response.status()} ${response.request().method()} ${url}`);
    if (response.status() >= 400) {
      const body = await response.text().catch(() => "");
      console.error(`E2E_AUTH_HTTP_BODY=${body.slice(0, 1000)}`);
    }
  }
});

try {
  console.log(`E2E_BASE_URL=${baseUrl}`);
  console.log("VERCEL_PROTECTION_BYPASS=AVAILABLE");

  const bootstrapUrl = new URL(`${baseUrl}/auth`);
  bootstrapUrl.searchParams.set("x-vercel-protection-bypass", vercelBypassSecret);
  bootstrapUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");
  await page.goto(bootstrapUrl.toString(), { waitUntil: "domcontentloaded" });

  const bypassCookies = await context.cookies(baseUrl);
  console.log(
    `E2E_VERCEL_BYPASS_COOKIES=${bypassCookies
      .filter(({ name }) => name.toLowerCase().includes("vercel"))
      .map(({ name }) => name)
      .join(",") || "NONE"}`,
  );

  await page.locator("#login-email").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForFunction(
    () =>
      document.readyState === "complete" &&
      Boolean(document.querySelector('form button[type="submit"]')),
    undefined,
    { timeout: 15000 },
  );
  await page.waitForTimeout(750);

  const emailInput = page.locator("#login-email");
  const passwordInput = page.locator("#login-password");
  const submitButton = page.getByRole("button", { name: "Se connecter", exact: true });

  await emailInput.fill(email);
  await passwordInput.click();
  await passwordInput.pressSequentially(password);

  let inputState = await page.evaluate(() => ({
    email: document.querySelector("#login-email")?.value ?? "",
    passwordLength: document.querySelector("#login-password")?.value.length ?? 0,
  }));

  if (inputState.passwordLength === 0) {
    await passwordInput.evaluate((element, value) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, password);
  }

  inputState = await page.evaluate(() => ({
    email: document.querySelector("#login-email")?.value ?? "",
    passwordLength: document.querySelector("#login-password")?.value.length ?? 0,
  }));

  console.log(`E2E_LOGIN_EMAIL_FILLED=${inputState.email === email ? "YES" : "NO"}`);
  console.log(`E2E_LOGIN_PASSWORD_LENGTH=${inputState.passwordLength}`);

  if (inputState.email !== email || inputState.passwordLength === 0) {
    throw new Error(
      `Login form state did not stabilize before submit (email=${inputState.email === email}, passwordLength=${inputState.passwordLength}).`,
    );
  }

  console.log("E2E_LOGIN_FORM_READY=YES");
  await submitButton.click({ force: true });

  await page.waitForFunction(
    () =>
      window.location.pathname === "/admin" ||
      window.location.pathname.startsWith("/admin/") ||
      Boolean(document.querySelector('[role="alert"]')) ||
      Boolean(document.querySelector('[role="status"]')) ||
      document.body.innerText.includes("Le chargement a échoué"),
    undefined,
    { timeout: 20000 },
  );

  console.log(`E2E_POST_LOGIN_URL=${page.url()}`);
  console.log(`E2E_POST_LOGIN_TITLE=${await page.title().catch(() => "<unavailable>")}`);

  const authAlert = await page.locator('[role="alert"]').first().textContent().catch(() => null);
  if (authAlert) throw new Error(`Supabase login rejected: ${authAlert.trim()}`);

  const statusMessage = await page.locator('[role="status"]').first().textContent().catch(() => null);
  if (statusMessage) console.log(`E2E_AUTH_STATUS=${statusMessage.trim()}`);

  const rootError = await page
    .getByText("Le chargement a échoué", { exact: true })
    .isVisible()
    .catch(() => false);
  if (rootError) {
    throw new Error("Production app entered the TanStack root error boundary during admin login.");
  }

  const storageKeys = await page.evaluate(() => Object.keys(localStorage));
  console.log(
    `E2E_SUPABASE_STORAGE_KEYS=${storageKeys.filter((key) => key.includes("auth-token")).join(",") || "NONE"}`,
  );

  await page.waitForURL((url) => url.pathname === "/admin" || url.pathname.startsWith("/admin/"), {
    timeout: 15000,
  });

  await page.waitForLoadState("networkidle");
  await page.getByText("BA Medical", { exact: true }).waitFor({ state: "visible", timeout: 15000 });
  console.log("AUTH_ADMIN=PASS");

  await page.goto(`${baseUrl}/admin/catalog`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Activation catalogue" }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.getByText("Supabase authority", { exact: false }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByText("File d’activation retail", { exact: false }).waitFor({ state: "visible", timeout: 15000 });

  const rows = await page.locator("text=Motif:").count();
  console.log(`ADMIN_CATALOG_ROWS=${rows}`);
  console.log("ADMIN_REPOSITORY_READ=PASS");
  console.log("PRODUCTION_ADMIN_AUTH_SMOKE=PASS");
} catch (error) {
  console.error(`E2E_CURRENT_URL=${page.url()}`);
  console.error(`E2E_PAGE_TITLE=${await page.title().catch(() => "<unavailable>")}`);
  const authError = await page.locator('[role="alert"]').first().textContent().catch(() => null);
  if (authError) console.error(`E2E_AUTH_ERROR=${authError.trim()}`);
  const storageKeys = await page.evaluate(() => Object.keys(localStorage)).catch(() => []);
  console.error(
    `E2E_SUPABASE_STORAGE_KEYS=${storageKeys.filter((key) => key.includes("auth-token")).join(",") || "NONE"}`,
  );
  await page.screenshot({ path: "admin-production-e2e-failure.png", fullPage: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
