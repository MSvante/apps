import type { Headline } from "../types/game.ts"
import { API_BASE, MIN_HEADLINE_LETTERS, MAX_HEADLINE_LENGTH } from "../constants/config.ts"

interface NewsDataArticle {
  title: string
  source_name?: string
  source_id?: string
}

interface NewsDataResponse {
  status: string
  results: NewsDataArticle[] | { code?: string; message?: string } | null
}

/** Shown when the free plan's daily request quota (200/day) is used up. */
export const RATE_LIMIT_MESSAGE =
  "Today's headline limit for the news API has been reached. Come back tomorrow for new headlines."

const RATE_LIMIT_CODES = ["RateLimitExceeded", "ApiLimitExceeded", "TooManyRequests"]

export async function fetchHeadlines(): Promise<Headline[]> {
  const response = await fetch(API_BASE)

  if (response.status === 429) {
    throw new Error(RATE_LIMIT_MESSAGE)
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid API key. Please update the API key in constants/config.ts")
  }

  if (!response.ok) {
    // newsdata.io can also report the quota in the JSON body of an error response
    const body = await response.json().catch(() => null) as NewsDataResponse | null
    const code = body && body.results && !Array.isArray(body.results) ? body.results.code : undefined
    if (code && RATE_LIMIT_CODES.includes(code)) throw new Error(RATE_LIMIT_MESSAGE)

    throw new Error(`Failed to fetch headlines (HTTP ${response.status})`)
  }

  const data: NewsDataResponse = await response.json()

  if (data.status !== "success" && data.results && !Array.isArray(data.results)) {
    const code = data.results.code
    if (code && RATE_LIMIT_CODES.includes(code)) throw new Error(RATE_LIMIT_MESSAGE)
  }

  const allArticles = data.status === "success" && Array.isArray(data.results) ? data.results : []

  const seen = new Set<string>()
  const headlines: Headline[] = allArticles
    .filter(article => {
      if (!article.title) return false
      if (seen.has(article.title)) return false
      seen.add(article.title)
      const letterCount = (article.title.match(/[a-zA-Z]/g) || []).length
      return letterCount >= MIN_HEADLINE_LETTERS && article.title.length <= MAX_HEADLINE_LENGTH
    })
    .map(article => ({
      title: article.title,
      source: article.source_name || article.source_id || "Unknown",
    }))

  if (headlines.length === 0) {
    throw new Error("No suitable headlines found. Please try again later.")
  }

  // Shuffle to mix sources
  for (let i = headlines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [headlines[i], headlines[j]] = [headlines[j], headlines[i]]
  }

  return headlines
}
