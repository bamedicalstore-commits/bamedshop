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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function httpsRequest({ hostname, servername, path, method = "GET", headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname,
        servername,
        path,
        method,
        headers,
        rejectUnauthorized: true,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            headers: response.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    request.once("error", reject);
    if (body?.length) request.write(body);
    request.end();
  });
}

async function resolveSupabaseHost() {
  try {
    const addresses = execFileSync("getent", ["ahostsv4", supabaseHost], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean);
    if (addresses.length > 0) return unique(addresses);
  } catch {
    // Fall through to DNS-over-HTTPS when the runner resolver cannot resolve Supabase.
  }

  const queryUrl = `/dns-query?name=${encodeURIComponent(supabaseHost)}&type=A`;
  const response = await httpsRequest({
    hostname: "1.1.1.1",
    servername: "cloudflare-dns.com",
    path: queryUrl,
    headers: {
      accept: "application/dns-json",
      host: "cloudflare-dns.com",
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`DNS-over-HTTPS returned HTTP ${response.status}.`);
  }
  const answers = JSON.parse(response.body.toString("utf8")).Answer ?? [];
  const addresses = unique(
    answers.filter((answer) => answer.type === 1).map((answer) => answer.data),
  );
  if (addresses.length === 0) {
    throw new Error(`Unable to resolve ${supabaseHost} through DNS-over-HTTPS.`);
  }
  return addresses;
}

const supabaseIps = await resolveSupabaseHost();
console.log(`E2E_SUPABASE_DNS=${supabaseHost} -> ${supabaseIps.join(",")}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const baseOrigin = new URL(baseUrl).origin;
const supabaseOrigin = `https://${supabaseHost}`;

async function proxySupabaseRequest(route) {
  const request = route.request();
  const requestUrl = new URL(request.url());
  const method = request.method();
  const path = `${requestUrl.pathname}${requestUrl.search}`;
  console.log(`E2E_SUPABASE_PROXY_REQUEST=${method} ${path}`);

  if (method === "OPTIONS") {
    const requestedHeaders = request.headerValue("access-control-request-headers");
    await route.fulfill({
      status: 204,
      headers: {
        "access-control-allow-origin": baseOrigin,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": requestedHeaders || "*",
        "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        vary: "Origin",
      },
      body: "",
    });
    console.log(`E2E_SUPABASE_PROXY_RESPONSE=204 ${path}`);
    return;
  }

  const originalHeaders = { ...request.headers() };
  delete originalHeaders.host;
  delete originalHeaders["content-length"];
  delete originalHeaders["transfer-encoding"];
  delete originalHeaders.connection;
  delete originalHeaders["accept-encoding"];
  originalHeaders.origin = baseOrigin;
  originalHeaders.host = supabaseHost;
  originalHeaders["accept-encoding"] = "identity";

  const body = request.postDataBuffer() ?? undefined;
  let response;
  let lastError;

  for (const ip of supabaseIps) {
    try {
      response = await httpsRequest({
        hostname: ip,
        servername: supabaseHost,
        path,
        method,
        headers: originalHeaders,
        body,
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    throw new Error(
      `Supabase proxy connection failed for ${method} ${path}: ${lastError?.message ?? "unknown error"}`,
    );
  }

  const responseHeaders = {};
  for (const [name, value] of Object.entries(response.headers)) {
    if (
      [
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "content-length",
        "content-encoding",
      ].includes(name.toLowerCase())
    ) {
      continue;
    }
    if (value !== undefined) {
      responseHeaders[name] = Array.isArray(value) ? value.join(", ") : value;
    }
  }
  responseHeaders["access-control-allow-origin"] = baseOrigin;
  responseHeaders["access-control-allow-credentials"] = "true";
  responseHeaders.vary = responseHeaders.vary ? `${responseHeaders.vary}, Origin` : "Origin";

  await route.fulfill({
    status: response.status,
    headers: responseHeaders,
    body: response.body,
  });
  console.log(`E2E_SUPABASE_PROXY_RESPONSE=${response.status} ${path}`);
}

await context.route("**/*", async (route) => {
  const requestUrl = route.request().url();
  const requestOrigin = new URL(requestUrl).origin;

  if (requestOrigin === supabaseOrigin) {
    try {
      await proxySupabaseRequest(route);
    } catch (error) {
      console.error(
        `E2E_SUPABASE_PROXY_ERROR=${error instanceof Error ? error.message : String(error)}`,
      );
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

page.on("pageerror", (error) => console.error(`E2E_PAGE_ERROR=${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") console.error(`E2E_CONSOLE_ERROR=${message.text()}`);
});
page.on("requestfailed", (request) => {
  if (request.url().includes("/auth/v1/") || request.url().includes("supabase")) {
    console.error(
      `E2E_REQUEST_FAILED=${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`,
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
  console.log("E2E_SUPABASE_PROXY=ENABLED");

  const bootstrapUrl = new URL(`${baseUrl}/auth`);
  bootstrapUrl.searchParams.set("x-vercel-protection-bypass", vercelBypassSecret);
  bootstrapUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");
  await page.goto(bootstrapUrl.toString(), { waitUntil: "domcontentloaded" });

  const bypassCookies = await context.cookies(baseUrl);
  console.log(
    `E2E_VERCEL_BYPASS_COOKIES=${
      bypassCookies
        .filter(({ name }) => name.toLowerCase().includes("vercel"))
        .map(({ name }) => name)
        .join(",") || "NONE"
    }`,
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
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
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
  await page.getByRole("heading", { name: "Activation catalogue" }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByText("Supabase authority", { exact: false }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByText("File d’activation retail", { exact: false }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByText("Chargement Supabase…", { exact: true }).waitFor({ state: "hidden", timeout: 15000 });
  const catalogError = await page.getByText("Action refusée", { exact: true }).count();
  if (catalogError > 0) {
    throw new Error("Catalog repository read failed: Action refusée is visible.");
  }
  const rows = await page.locator("text=Motif:").count();
  console.log(`ADMIN_CATALOG_ROWS=${rows}`);
  console.log("ADMIN_CATALOG_LOAD=PASS");
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
