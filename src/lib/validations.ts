import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const toolSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  tagline: z.string().min(10).max(300),
  description: z.string().min(50).max(5000),
  websiteUrl: z.string().url(),
  logo: z.string().url().optional(),
  pricing: z.enum(["FREE", "FREEMIUM", "PAID", "CONTACT"]),
  pricingDetail: z.string().max(500).optional(),
  startingPrice: z.number().positive().optional(),
  categoryIds: z.array(z.string()).min(1),
  tagIds: z.array(z.string()).optional(),
  pros: z.array(z.object({ text: z.string().min(2).max(500) })).optional(),
  cons: z.array(z.object({ text: z.string().min(2).max(500) })).optional(),
  screenshots: z
    .array(
      z.object({ url: z.string().url(), alt: z.string().optional() })
    )
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5).max(500),
        answer: z.string().min(10).max(2000),
      })
    )
    .optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000).optional(),
})

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  pricing: z.enum(["FREE", "FREEMIUM", "PAID", "CONTACT"]).optional(),
  sort: z.enum(["newest", "popular", "rating"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ToolInput = z.infer<typeof toolSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type SearchInput = z.infer<typeof searchSchema>
