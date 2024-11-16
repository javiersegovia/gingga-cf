import { drizzle } from 'drizzle-orm/libsql'
import { createClient as createWebClient } from '@libsql/client/web'
import { createClient as createLocalClient } from '@libsql/client/sqlite3'
import * as schema from './schema'

export function getDbSetup(env: Env) {
  const url = env.TURSO_LOCAL_DB_URL?.trim()
  const localUrl = env.TURSO_LOCAL_DB_URL?.trim()
  const authToken = env.TURSO_API_TOKEN?.trim()

  const mode = 'NODE_ENV' in env ? env.NODE_ENV : process.env.NODE_ENV

  if (mode === 'development') {
    if (!localUrl) {
      throw new Error(
        `TURSO_LOCAL_DB_URL is required for development mode.
    Make sure you create a database in the root directory and add that url to the .dev.vars file.
    
    Example: TURSO_LOCAL_DB_URL="file:local.db"`,
      )
    }

    return {
      url: localUrl,
      authToken: undefined,
      dialect: 'sqlite' as const,
      client: createLocalClient({ url: localUrl }),
    }
  }

  if (!url || !authToken) {
    throw new Error(
      'TURSO_DB_URL or TURSO_AUTH_TOKEN is not set. Update your .dev.vars file.',
    )
  }

  return {
    url,
    authToken,
    dialect: 'turso' as const,
    client: createWebClient({ url, authToken }),
  }
}

export function buildDb(env: Env) {
  const { client } = getDbSetup(env)
  const db = drizzle(client, { schema })

  function closeDbConnection() {
    if (!client.closed) client.close()
  }

  return { db, closeDbConnection }
}
