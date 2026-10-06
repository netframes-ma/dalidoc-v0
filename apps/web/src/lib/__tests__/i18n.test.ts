import { describe, expect, it } from "vitest";
import { translate } from "../i18n/messages";
import { parsePreferences, serializePreferences, DEFAULT_PREFERENCES } from "../preferences";
import { can } from "../permissions";

describe("i18n", () => {
  it("interpolates and picks plural forms per locale", () => {
    expect(translate("fr", "changes.title", { fields: 1, teeth: 1 })).toBe("1 modification sur 1 dent");
    expect(translate("fr", "changes.title", { fields: 3, teeth: 2 })).toBe("3 modifications sur 2 dents");
    expect(translate("en", "changes.title", { fields: 1, teeth: 2 })).toBe("1 change on 2 teeth");
    expect(translate("ar", "tooth.label", { tooth: 16 })).toBe("السن 16");
  });
});

describe("preferences cookie", () => {
  it("round-trips and falls back field by field", () => {
    const prefs = { ...DEFAULT_PREFERENCES, locale: "ar" as const, role: "assistant" as const };
    expect(parsePreferences(serializePreferences(prefs))).toEqual(prefs);
    expect(parsePreferences(encodeURIComponent(JSON.stringify({ locale: "xx", brand: "violet" })))).toEqual({ ...DEFAULT_PREFERENCES, brand: "violet" });
    expect(parsePreferences("%%%")).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("permissions", () => {
  it("lets only dentists and owners validate clinical entries", () => {
    expect(can("dentist", "clinical:validate")).toBe(true);
    expect(can("owner", "clinical:validate")).toBe(true);
    expect(can("assistant", "clinical:validate")).toBe(false);
    expect(can("receptionist", "chart:edit")).toBe(false);
    expect(can("assistant", "chart:edit")).toBe(true);
  });
});
