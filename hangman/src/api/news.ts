import type { Headline } from "../types/game.ts"
import { API_URL, MIN_HEADLINE_LETTERS, MAX_HEADLINE_LENGTH } from "../constants/config.ts"

interface NewsDataArticle {
  title: string
  source_name?: string
  source_id?: string
}

interface NewsDataResponse {
  status: string
  results: NewsDataArticle[] | null
}

export async function fetchHeadlines(): Promise<Headline[]> {
  const response = await fetch(API_URL)

  if (response.status === 429) {
    throw new Error("Daily API rate limit reached. Please try again tomorrow.")
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid API key. Please update the API key in constants/config.ts")
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch headlines (HTTP ${response.status})`)
  }

  const data: NewsDataResponse = await response.json()

  if (data.status !== "success" || !data.results) {
    throw new Error("Unexpected API response format")
  }

  const headlines: Headline[] = data.results
    .filter(article => {
      if (!article.title) return false
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

  return headlines
}
