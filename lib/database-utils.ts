import { getDemoConfig } from './demo-mode'

export interface DatabaseProvider {
  isPostgreSQL: boolean
  isSQLite: boolean
}

export function getDatabaseProvider(): DatabaseProvider {
  const connectionUrl = process.env.DATABASE_URL || ''
  
  const isPostgreSQL = connectionUrl.includes('postgres') || connectionUrl.includes('postgresql')
  const isSQLite = connectionUrl.startsWith('file:') || connectionUrl.includes('sqlite')
  
  return {
    isPostgreSQL,
    isSQLite
  }
}

export interface StringFilterOptions {
  contains: string
  mode?: 'insensitive' | 'default'
}

export function createStringFilter(value: string): any {
  const { isSQLite } = getDatabaseProvider()
  
  if (isSQLite) {
    // SQLite doesn't support mode: "insensitive", so we just use contains
    return { contains: value }
  } else {
    // PostgreSQL supports case-insensitive mode
    return { contains: value, mode: 'insensitive' }
  }
}

export function createSearchFilters(terms: string[]) {
  return terms.map(term => ({
    OR: [
      { title: createStringFilter(term) },
      { abstract: createStringFilter(term) },
      { keywords: createStringFilter(term) },
      { organismTypes: createStringFilter(term) },
      { microbialCommunity: createStringFilter(term) }
    ]
  }))
}