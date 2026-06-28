import { describe, it, expect } from "vitest"
import { cn, slugify, truncate, formatDate, formatRating } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })
})

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world")
  })

  it("collapses multiple hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world")
  })

  it("handles empty string", () => {
    expect(slugify("")).toBe("")
  })
})

describe("truncate", () => {
  it("returns text if shorter than length", () => {
    expect(truncate("short", 10)).toBe("short")
  })

  it("truncates and adds ellipsis", () => {
    expect(truncate("a very long string indeed", 10)).toBe("a very lon...")
  })

  it("trims trailing whitespace before ellipsis", () => {
    expect(truncate("hello world", 6)).toBe("hello...")
  })
})

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-01-15")
    expect(result).toMatch(/Jan \d+, 2024/)
  })

  it("formats a Date object", () => {
    const result = formatDate(new Date(2024, 0, 15))
    expect(result).toMatch(/Jan \d+, 2024/)
  })
})

describe("formatRating", () => {
  it("formats a rating to one decimal", () => {
    expect(formatRating(4.567)).toBe("4.6")
  })

  it("formats a whole number", () => {
    expect(formatRating(5)).toBe("5.0")
  })
})
