/**
 * Tests for date utility functions
 */

import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDateKey,
  parseISOToDateKey,
} from "../date";

describe("date utilities", () => {
  describe("getDaysInMonth", () => {
    it("should return 31 days for January", () => {
      expect(getDaysInMonth(2024, 0)).toBe(31);
    });

    it("should return 29 days for February in leap year", () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it("should return 28 days for February in non-leap year", () => {
      expect(getDaysInMonth(2023, 1)).toBe(28);
    });

    it("should return 30 days for April", () => {
      expect(getDaysInMonth(2024, 3)).toBe(30);
    });

    it("should return 31 days for December", () => {
      expect(getDaysInMonth(2024, 11)).toBe(31);
    });
  });

  describe("getFirstDayOfMonth", () => {
    it("should return 0 (Sunday) for January 1, 2023", () => {
      // January 1, 2023 was a Sunday
      expect(getFirstDayOfMonth(2023, 0)).toBe(0);
    });

    it("should return 3 (Wednesday) for February 1, 2023", () => {
      // February 1, 2023 was a Wednesday
      expect(getFirstDayOfMonth(2023, 1)).toBe(3);
    });

    it("should return 1 (Monday) for January 1, 2024", () => {
      // January 1, 2024 was a Monday
      expect(getFirstDayOfMonth(2024, 0)).toBe(1);
    });

    it("should return 5 (Friday) for December 1, 2023", () => {
      // December 1, 2023 was a Friday
      expect(getFirstDayOfMonth(2023, 11)).toBe(5);
    });
  });

  describe("formatDateKey", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(formatDateKey(date)).toBe("2024-01-15");
    });

    it("should pad single digit month", () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      expect(formatDateKey(date)).toBe("2024-01-01");
    });

    it("should pad single digit day", () => {
      const date = new Date(2024, 11, 5); // December 5, 2024
      expect(formatDateKey(date)).toBe("2024-12-05");
    });

    it("should handle double digit month and day", () => {
      const date = new Date(2024, 9, 25); // October 25, 2024
      expect(formatDateKey(date)).toBe("2024-10-25");
    });
  });

  describe("parseISOToDateKey", () => {
    it("should parse ISO string to YYYY-MM-DD format", () => {
      expect(parseISOToDateKey("2024-01-15T10:30:00.000Z")).toBe("2024-01-15");
    });

    it("should parse ISO string with different time", () => {
      // Note: Date constructor may adjust for timezone, so we test the format is valid
      const result = parseISOToDateKey("2024-12-25T12:00:00.000Z");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle ISO string with timezone offset", () => {
      // Note: Result may vary based on system timezone
      // This test assumes the ISO string is parsed correctly
      const result = parseISOToDateKey("2024-06-15T12:00:00+05:00");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should parse simple date string", () => {
      expect(parseISOToDateKey("2024-03-10")).toBe("2024-03-10");
    });
  });
});
