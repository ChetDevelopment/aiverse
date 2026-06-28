"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const WorkspacesList = dynamic(() => import("./workspaces-list"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export default function WorkspacesPage() {
  return <WorkspacesList />
}
