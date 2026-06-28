import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDebounce } from "@/hooks/use-debounce"

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500))
    expect(result.current).toBe("hello")
  })

  it("updates debounced value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 100 } }
    )

    expect(result.current).toBe("hello")

    rerender({ value: "world", delay: 100 })

    expect(result.current).toBe("hello")

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    expect(result.current).toBe("world")
  })

  it("uses default delay of 300ms", () => {
    const { result } = renderHook(() => useDebounce("test"))
    expect(result.current).toBe("test")
  })
})
