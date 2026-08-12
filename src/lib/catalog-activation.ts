export type ActivationReadiness = {
  retailPriceTnd: number | null;
  mediaApproved: boolean;
  copyApproved: boolean;
};

export type ActivationDecision =
  | { ok: true; reason: "ready" }
  | {
      ok: false;
      reason: "missing_retail_price" | "media_not_approved" | "copy_not_approved";
    };

/**
 * Customer-facing catalogue activation is deliberately fail-closed.
 *
 * Supplier/list prices are never accepted as an input to this gate. The only
 * price accepted here is an explicitly approved BA Medical Store retail price.
 */
export function evaluateProductActivation(
  readiness: ActivationReadiness,
): ActivationDecision {
  if (
    readiness.retailPriceTnd === null ||
    !Number.isFinite(readiness.retailPriceTnd) ||
    readiness.retailPriceTnd <= 0
  ) {
    return { ok: false, reason: "missing_retail_price" };
  }

  if (!readiness.mediaApproved) {
    return { ok: false, reason: "media_not_approved" };
  }

  if (!readiness.copyApproved) {
    return { ok: false, reason: "copy_not_approved" };
  }

  return { ok: true, reason: "ready" };
}

export function canActivateProduct(readiness: ActivationReadiness): boolean {
  return evaluateProductActivation(readiness).ok;
}
