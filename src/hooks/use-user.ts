"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
