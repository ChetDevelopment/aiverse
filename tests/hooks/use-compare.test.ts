import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCompare } from "@/hooks/use-compare"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe("useCompare", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("starts with empty slugs", () => {
    const { result } = renderHook(() => useCompare())
    expect(result.current.slugs).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.canCompare).toBe(false)
  })

  it("adds a slug to compare", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    expect(result.current.slugs).toEqual(["tool-1"])
    expect(result.current.count).toBe(1)
  })

  it("toggles slug on re-add", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    act(() => result.current.addToCompare("tool-1"))
    expect(result.current.slugs).toEqual([])
  })

  it("enforces max 3 items", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    act(() => result.current.addToCompare("tool-2"))
    act(() => result.current.addToCompare("tool-3"))
    act(() => result.current.addToCompare("tool-4"))
    expect(result.current.slugs).toHaveLength(3)
  })

  it("removes a slug", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    act(() => result.current.addToCompare("tool-2"))
    act(() => result.current.removeFromCompare("tool-1"))
    expect(result.current.slugs).toEqual(["tool-2"])
  })

  it("checks if slug is in compare", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    expect(result.current.isInCompare("tool-1")).toBe(true)
    expect(result.current.isInCompare("tool-2")).toBe(false)
  })

  it("clears all slugs", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    act(() => result.current.addToCompare("tool-2"))
    act(() => result.current.clearCompare())
    expect(result.current.slugs).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it("canCompare is true with 2+ items", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    expect(result.current.canCompare).toBe(false)
    act(() => result.current.addToCompare("tool-2"))
    expect(result.current.canCompare).toBe(true)
  })

  it("goToCompare navigates to compare page", () => {
    const { result } = renderHook(() => useCompare())
    act(() => result.current.addToCompare("tool-1"))
    act(() => result.current.addToCompare("tool-2"))
    act(() => result.current.goToCompare())
    expect(mockPush).toHaveBeenCalledWith("/compare?tools=tool-1,tool-2")
  })
})
