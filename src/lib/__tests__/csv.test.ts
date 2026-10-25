import { describe, it, expect } from "vitest";
import { escapeCsvField } from "../../server/data-access/reports";

describe("CSV Export Formatting (RFC 4180)", () => {
  it("wraps standard strings in double quotes", () => {
    expect(escapeCsvField("Groceries")).toBe('"Groceries"');
  });

  it("escapes internal quotes with double quotes", () => {
    expect(escapeCsvField('Trader Joe\'s "Organic" Apples')).toBe('"Trader Joe\'s ""Organic"" Apples"');
  });

  it("handles strings with commas and newlines properly", () => {
    expect(escapeCsvField("Rent, Maintenance\nFlat 402")).toBe('"Rent, Maintenance\nFlat 402"');
  });

  it("handles null and undefined safely", () => {
    expect(escapeCsvField(null)).toBe('""');
    expect(escapeCsvField(undefined)).toBe('""');
  });
});
