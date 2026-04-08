import type { TFunction } from "i18next";

const CATEGORY_CODES = new Set(["t1", "t2", "t3"]);

/** Values saved before we switched to stable codes (label was stored in UI language). */
const LEGACY_LABEL_TO_CODE: Record<string, "t1" | "t2" | "t3"> = {
  "فاتورة مبيعات آجلة": "t1",
  "سلفة من الصندوق": "t2",
  "قسط بضاعة": "t3",
  "Deferred Sales Invoice": "t1",
  "Cash Advance": "t2",
  "Goods Installment": "t3",
};

export function resolveDebtCategoryCode(raw: string | undefined | null): "t1" | "t2" | "t3" | null {
  if (raw == null || raw === "") return null;
  const trimmed = raw.trim();
  if (CATEGORY_CODES.has(trimmed)) return trimmed as "t1" | "t2" | "t3";
  return LEGACY_LABEL_TO_CODE[trimmed] ?? null;
}

/** Label for lists and headers — follows current i18n language. */
export function formatDebtCategory(raw: string | undefined | null, t: TFunction): string {
  const code = resolveDebtCategoryCode(raw);
  if (code) return t(`debts.new.s2.types.${code}`);
  if (raw && raw.trim() !== "") return raw.trim();
  return t("debts.new.s2.types.t1");
}
