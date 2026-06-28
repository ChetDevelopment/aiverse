import type { z } from "zod"
import type { loginSchema, registerSchema, reviewSchema } from "@/lib/validations"

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: string
  children?: NavItem[]
}

export interface MetaData {
  title: string
  description: string
  ogImage?: string
  canonical?: string
}

export interface SearchParams {
  query?: string
  category?: string
  pricing?: string
  sort?: string
  page?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ToolCardData {
  id: string
  name: string
  slug: string
  tagline: string
  logo: string | null
  websiteUrl: string
  pricing: "FREE" | "FREEMIUM" | "PAID" | "CONTACT"
  pricingDetail: string | null
  startingPrice: number | null
  viewCount: number
  featuredScore: number
  isOpenSource?: boolean
  isEthical?: boolean
  categories: { category: { name: string; slug: string } }[]
  reviews: { rating: number }[]
}

export interface CategoryWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count: { tools: number }
}
