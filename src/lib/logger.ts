/**
 * Structured Logger
 *
 * Replaces console.log/error/warn with structured JSON logging.
 * - Production: JSON format (machine-readable for log aggregators)
 * - Development: Pretty-printed human-readable format
 * - Levels: debug, info, warn, error
 * - Includes: timestamp, level, message, metadata, error stack traces
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL = process.env.LOG_LEVEL as LogLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
    }
  }
  return { error_raw: String(error) }
}

function emit(entry: LogEntry): void {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    // JSON format for log aggregators (Railway, Datadog, etc.)
    const output = JSON.stringify(entry)
    if (entry.level === 'error') {
      process.stderr?.write ? process.stderr.write(output + '\n') : console.error(output)
    } else {
      process.stdout?.write ? process.stdout.write(output + '\n') : console.log(output)
    }
  } else {
    // Pretty format for development
    const { timestamp, level, message, ...meta } = entry
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level]
    const reset = '\x1b[0m'
    const prefix = `${color}[${level.toUpperCase()}]${reset} ${timestamp}`
    const metaStr = Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta, null, 2) : ''

    if (level === 'error') {
      console.error(`${prefix} ${message}${metaStr}`)
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}${metaStr}`)
    } else {
      console.log(`${prefix} ${message}${metaStr}`)
    }
  }
}

function createLogFn(level: LogLevel) {
  return (message: string, meta?: Record<string, unknown> | unknown) => {
    if (!shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (meta !== undefined) {
      if (meta instanceof Error) {
        Object.assign(entry, formatError(meta))
      } else if (typeof meta === 'object' && meta !== null) {
        Object.assign(entry, meta)
      } else {
        entry.data = meta
      }
    }

    emit(entry)
  }
}

export const logger = {
  debug: createLogFn('debug'),
  info: createLogFn('info'),
  warn: createLogFn('warn'),
  error: createLogFn('error'),

  /**
   * Create a child logger with default metadata (e.g., route, requestId)
   */
  child(defaultMeta: Record<string, unknown>) {
    return {
      debug: (msg: string, meta?: Record<string, unknown>) =>
        logger.debug(msg, { ...defaultMeta, ...meta }),
      info: (msg: string, meta?: Record<string, unknown>) =>
        logger.info(msg, { ...defaultMeta, ...meta }),
      warn: (msg: string, meta?: Record<string, unknown>) =>
        logger.warn(msg, { ...defaultMeta, ...meta }),
      error: (msg: string, meta?: Record<string, unknown> | unknown) =>
        logger.error(msg, meta instanceof Error ? { ...defaultMeta, ...formatError(meta) } : { ...defaultMeta, ...(meta as Record<string, unknown>) }),
    }
  },
}

export default logger
