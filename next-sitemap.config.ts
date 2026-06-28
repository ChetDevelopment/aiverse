import type { IConfig } from "next-sitemap"

const config: IConfig = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  generateRobotsTxt: false,
  exclude: ["/api/*", "/admin/*", "/profile/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/admin/", "/profile/"] },
    ],
  },
}

export default config
