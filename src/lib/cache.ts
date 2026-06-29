interface CacheEntry<T> {
  value: T
  expiresAt: number
}

function createMemoryCache() {
  const store = new Map<string, CacheEntry<unknown>>()

  if (typeof process !== "undefined" && process?.env?.NODE_ENV !== "test") {
    const timer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of store) {
        if (entry.expiresAt <= now) store.delete(key)
      }
    }, 60_000)
    if (typeof timer === "object" && timer && "unref" in timer) {
      ;(timer as NodeJS.Timeout).unref()
    }
  }

  return {
    get<T>(key: string): T | undefined {
      const entry = store.get(key) as CacheEntry<T> | undefined
      if (!entry) return undefined
      if (entry.expiresAt <= Date.now()) {
        store.delete(key)
        return undefined
      }
      return entry.value
    },
    set<T>(key: string, value: T, ttlMs: number): void {
      store.set(key, { value, expiresAt: Date.now() + ttlMs })
    },
    delete(key: string): void {
      store.delete(key)
    },
    clear(): void {
      store.clear()
    },
  }
}

export const cache = createMemoryCache()

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

let redisClient: {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, ttl: number) => Promise<void>
} | null = null

if (UPSTASH_REDIS_URL && UPSTASH_REDIS_TOKEN) {
  const baseUrl = `${UPSTASH_REDIS_URL.replace(/\/$/, "")}/`
  const headers = {
    Authorization: `Bearer ${UPSTASH_REDIS_TOKEN}`,
    "Content-Type": "application/json",
  }

  redisClient = {
    async get(key: string) {
      try {
        const res = await fetch(`${baseUrl}get/${key}`, { headers })
        if (!res.ok) return null
        const data = await res.json()
        return data.result ?? null
      } catch {
        return null
      }
    },
    async set(key: string, value: string, ttl: number) {
      try {
        await fetch(`${baseUrl}set/${key}`, {
          method: "POST",
          headers,
          body: JSON.stringify(value),
        })
        await fetch(`${baseUrl}expire/${key}/${ttl}`, {
          method: "POST",
          headers,
        })
      } catch {}
    },
  }
}

export async function getOrSet<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  if (redisClient) {
    try {
      const cached = await redisClient.get(key)
      if (cached) return JSON.parse(cached) as T
    } catch {}
    const value = await fn()
    try {
      await redisClient.set(
        key,
        JSON.stringify(value),
        Math.ceil(ttlMs / 1000),
      )
    } catch {}
    return value
  }

  const cached = cache.get<T>(key)
  if (cached !== undefined) return cached
  const value = await fn()
  cache.set(key, value, ttlMs)
  return value
}
