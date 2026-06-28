import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

describe("Card", () => {
  it("renders card with children", () => {
    render(<Card>Content</Card>)
    expect(screen.getByText("Content")).toBeInTheDocument()
  })

  it("renders with custom className", () => {
    render(<Card className="custom-class">Card</Card>)
    const card = screen.getByText("Card")
    expect(card.className).toContain("custom-class")
  })
})

describe("CardHeader", () => {
  it("renders header content", () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText("Header")).toBeInTheDocument()
  })
})

describe("CardTitle", () => {
  it("renders title text", () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText("Title")).toBeInTheDocument()
  })
})

describe("CardDescription", () => {
  it("renders description text", () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText("Description")).toBeInTheDocument()
  })
})

describe("CardContent", () => {
  it("renders content", () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})

describe("CardFooter", () => {
  it("renders footer content", () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText("Footer")).toBeInTheDocument()
  })
})
