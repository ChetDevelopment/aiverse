import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it("renders with variant", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button", { name: /delete/i })
    expect(button).toBeInTheDocument()
  })

  it("renders with loading state", () => {
    render(<Button loading>Saving</Button>)
    const button = screen.getByRole("button", { name: /saving/i })
    expect(button).toBeDisabled()
  })

  it("renders disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: /disabled/i })
    expect(button).toBeDisabled()
  })

  it("shows spinner icon when loading", () => {
    const { container } = render(<Button loading>Loading</Button>)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass("animate-spin")
  })
})
