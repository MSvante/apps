import GameContainer from "./components/GameContainer.tsx"

export default function App() {
  return (
    <div className="min-h-[100dvh] flex flex-col font-[Nunito,sans-serif]">
      <header className="px-4 pt-4 pb-2">
        <a
          href="/apps/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to Apps
        </a>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4">
        <h1 className="text-3xl font-extrabold text-center mb-5 text-gray-800">
          Headline Hangman
        </h1>
        <GameContainer />
      </main>
    </div>
  )
}
