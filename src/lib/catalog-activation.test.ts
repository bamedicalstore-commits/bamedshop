import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { canActivateProduct, evaluateProductActivation } from "./catalog-activation";

describe("product retail activation gate", () => {
  const approved = {
    retailPriceTnd: 129.9,
    retailPriceApproved: true,
    mediaApproved: true,
    copyApproved: true,
  };

  it("accepts a fully approved customer-facing product", () => {
    expect(evaluateProductActivation(approved)).toEqual({ ok: true, reason: "ready" });
    expect(canActivateProduct(approved)).toBe(true);
  });

  it("rejects missing, zero, negative, or non-finite retail prices", () => {
    for (const retailPriceTnd of [null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(canActivateProduct({ ...approved, retailPriceTnd })).toBe(false);
      expect(evaluateProductActivation({ ...approved, retailPriceTnd })).toEqual({
        ok: false,
        reason: "missing_retail_price",
      });
    }
  });

  it("rejects a retail price that has not been explicitly approved", () => {
    expect(evaluateProductActivation({ ...approved, retailPriceApproved: false })).toEqual({
      ok: false,
      reason: "retail_price_not_approved",
    });
  });

  it("rejects products without approved media", () => {
    expect(evaluateProductActivation({ ...approved, mediaApproved: false })).toEqual({
      ok: false,
      reason: "media_not_approved",
    });
  });

  it("rejects products without approved customer-facing copy", () => {
    expect(evaluateProductActivation({ ...approved, copyApproved: false })).toEqual({
      ok: false,
      reason: "copy_not_approved",
    });
  });

  it("fails closed when multiple requirements are missing", () => {
    expect(
      evaluateProductActivation({
        retailPriceTnd: null,
        retailPriceApproved: false,
        mediaApproved: false,
        copyApproved: false,
      }),
    ).toEqual({ ok: false, reason: "missing_retail_price" });
  });

  it("keeps the database activation boundary fail-closed and admin-only", () => {
    const migration = readFileSync(
      "supabase/migrations/202608120001_catalog_activation_engine.sql",
      "utf8",
    );

    expect(migration).toContain("create or replace function public.activate_catalog_product");
    expect(migration).toContain("public.has_role('admin'::public.app_role, auth.uid())");
    expect(migration).toContain("public.has_role('super_admin'::public.app_role, auth.uid())");
    expect(migration).toContain("catalog_activation_forbidden");
    expect(migration).toContain("catalog_activation_status = 'ACTIVE'");
    expect(migration).toContain("create or replace view public.retail_catalog");
  });
});
