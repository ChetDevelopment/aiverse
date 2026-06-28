"use client"

import dynamic from "next/dynamic"

export const FloatingChat = dynamic(() => import("@/components/ai-assistant/floating-chat").then((m) => ({ default: m.FloatingChat })), { ssr: false })

export const CommandPalette = dynamic(() => import("@/components/command-palette").then((m) => ({ default: m.CommandPalette })), { ssr: false })
