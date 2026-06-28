import { describe, it, expect } from "vitest"
import { loginSchema, registerSchema, reviewSchema, newsletterSchema } from "@/lib/validations"

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.parse({ email: "test@example.com", password: "password123" })
    expect(result.email).toBe("test@example.com")
  })

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "invalid", password: "password123" })).toThrow()
  })

  it("rejects short password", () => {
    expect(() => loginSchema.parse({ email: "test@example.com", password: "123" })).toThrow()
  })
})

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.parse({
      name: "John",
      email: "john@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    })
    expect(result.name).toBe("John")
  })

  it("rejects mismatched passwords", () => {
    expect(() =>
      registerSchema.parse({
        name: "John",
        email: "john@example.com",
        password: "Password1",
        confirmPassword: "Password2",
      })
    ).toThrow()
  })

  it("rejects password without uppercase", () => {
    expect(() =>
      registerSchema.parse({
        name: "John",
        email: "john@example.com",
        password: "password1",
        confirmPassword: "password1",
      })
    ).toThrow()
  })

  it("rejects password without number", () => {
    expect(() =>
      registerSchema.parse({
        name: "John",
        email: "john@example.com",
        password: "Password",
        confirmPassword: "Password",
      })
    ).toThrow()
  })
})

describe("reviewSchema", () => {
  it("accepts valid review", () => {
    const result = reviewSchema.parse({ rating: 4, comment: "Great tool!" })
    expect(result.rating).toBe(4)
  })

  it("rejects rating below 1", () => {
    expect(() => reviewSchema.parse({ rating: 0 })).toThrow()
  })

  it("rejects rating above 5", () => {
    expect(() => reviewSchema.parse({ rating: 6 })).toThrow()
  })
})

describe("newsletterSchema", () => {
  it("accepts valid email", () => {
    const result = newsletterSchema.parse({ email: "test@example.com" })
    expect(result.email).toBe("test@example.com")
  })

  it("rejects invalid email", () => {
    expect(() => newsletterSchema.parse({ email: "not-an-email" })).toThrow()
  })
})
