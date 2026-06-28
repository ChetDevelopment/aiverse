import { Suspense } from "react"
import { Hero } from "@/components/home/hero"
import dynamic from "next/dynamic"
import { SkeletonToolGrid } from "@/components/shared/premium-skeleton"

export const revalidate = 300

const PersonalizedDashboard = dynamic(
  () => import("@/components/home/personalized-dashboard").then((m) => ({ default: m.PersonalizedDashboard })),
  { loading: () => <div className="py-16"><SkeletonToolGrid count={6} /></div> },
)

export default function HomePage() {
  return (
    <>
      <Hero />

      <Suspense fallback={<div className="py-16"><SkeletonToolGrid count={6} /></div>}>
        <PersonalizedDashboard />
      </Suspense>
    </>
  )
}
