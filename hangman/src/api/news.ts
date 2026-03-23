import type { Headline } from "../types/game.ts"
import { API_BASE, MIN_HEADLINE_LETTERS, MAX_HEADLINE_LENGTH } from "../constants/config.ts"

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
  const response = await fetch(API_BASE)

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

  const allArticles = data.status === "success" && data.results ? data.results : []

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
