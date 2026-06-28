const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const
type LogLevel = keyof typeof LOG_LEVELS

const currentLevel: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "INFO"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, tag: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString()
  const dataStr = data ? ` ${JSON.stringify(data)}` : ""
  return `[${timestamp}] [${level}] [${tag}] ${message}${dataStr}`
}

export const logger = {
  debug(tag: string, message: string, data?: unknown) {
    if (shouldLog("DEBUG")) console.debug(formatMessage("DEBUG", tag, message, data))
  },
  info(tag: string, message: string, data?: unknown) {
    if (shouldLog("INFO")) console.info(formatMessage("INFO", tag, message, data))
  },
  warn(tag: string, message: string, data?: unknown) {
    if (shouldLog("WARN")) console.warn(formatMessage("WARN", tag, message, data))
  },
  error(tag: string, message: string, error?: unknown) {
    if (shouldLog("ERROR")) {
      const errorStr = error instanceof Error ? error.stack || error.message : String(error || "")
      console.error(formatMessage("ERROR", tag, message, { error: errorStr }))
    }
  },
}
