import { describe, it, expect } from "vitest";
import { normalizeForComparison } from "../normalize";

describe("normalizeForComparison", () => {
  it("strips diacritics", () => {
    expect(normalizeForComparison("Čech")).toBe("cech");
    expect(normalizeForComparison("Özil")).toBe("ozil");
    expect(normalizeForComparison("Agüero")).toBe("aguero");
    expect(normalizeForComparison("Mané")).toBe("mane");
    expect(normalizeForComparison("Bellerín")).toBe("bellerin");
  });

  it("lowercases", () => {
    expect(normalizeForComparison("ROONEY")).toBe("rooney");
    expect(normalizeForComparison("Van Dijk")).toBe("van dijk");
  });

  it("trims whitespace", () => {
    expect(normalizeForComparison("  salah  ")).toBe("salah");
  });

  it("handles already-normalized input", () => {
    expect(normalizeForComparison("sterling")).toBe("sterling");
  });

  it("does not match wrong letters (Eze != Ezee)", () => {
    expect(normalizeForComparison("Ezé")).toBe("eze");
    expect(normalizeForComparison("Ezee")).toBe("ezee");
    expect(normalizeForComparison("Ezé")).not.toBe(
      normalizeForComparison("Ezee")
    );
  });
});
