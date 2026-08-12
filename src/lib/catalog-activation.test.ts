import { describe, expect, it } from "bun:test";
import { canActivateProduct, evaluateProductActivation } from "./catalog-activation";

describe("product retail activation gate", () => {
  const approved = {
    retailPriceTnd: 129.9,
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
        mediaApproved: false,
        copyApproved: false,
      }),
    ).toEqual({ ok: false, reason: "missing_retail_price" });
  });
});
