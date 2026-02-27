export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase();
}

export function checkAnswer(guess: string, answer: string): boolean {
  return normalizeAnswer(guess) === normalizeAnswer(answer);
}
