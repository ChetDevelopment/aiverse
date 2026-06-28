import { describe, it, expect } from "vitest"
import { apiSuccess, apiError } from "@/lib/api-utils"

describe("apiSuccess", () => {
  it("returns data with default status 200", async () => {
    const response = apiSuccess({ message: "ok" })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ message: "ok" })
  })

  it("returns data with custom status", async () => {
    const response = apiSuccess({ id: 1 }, 201)
    expect(response.status).toBe(201)
  })
})

describe("apiError", () => {
  it("returns error message with default status 400", async () => {
    const response = apiError("Bad request")
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: "Bad request" })
  })

  it("returns error with custom status", async () => {
    const response = apiError("Not found", 404)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ error: "Not found" })
  })
})
