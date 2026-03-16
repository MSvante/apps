export function getDisplayChar(char: string, guessedLetters: Set<string>, revealed: boolean): string {
  const upper = char.toUpperCase()
  if (!/[A-Z]/.test(upper)) return char
  if (revealed || guessedLetters.has(upper)) return char
  return "_"
}

export function isWordSolved(word: string, guessedLetters: Set<string>): boolean {
  return [...word].every(char => {
    const upper = char.toUpperCase()
    return !/[A-Z]/.test(upper) || guessedLetters.has(upper)
  })
}

export function pickHiddenWordIndex(title: string): number {
  const words = title.split(" ")
  const total = words.length

  if (total <= 1) return 0

  // Build list of eligible indices: skip first 2 and last 2 unless < 4 words
  let eligible: number[]
  if (total < 4) {
    eligible = words.map((_, i) => i)
  } else {
    eligible = words.map((_, i) => i).filter(i => i >= 2 && i < total - 2)
  }

  // Prefer words with actual letters and at least 3 chars
  const preferred = eligible.filter(i => {
    const w = words[i]
    const letterCount = [...w].filter(ch => /[A-Z]/i.test(ch)).length
    return letterCount >= 3
  })

  const pool = preferred.length > 0 ? preferred : eligible
  return pool[Math.floor(Math.random() * pool.length)]
}
