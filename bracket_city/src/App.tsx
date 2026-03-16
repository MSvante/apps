import { useState } from "react";
import GameContainer from "./components/GameContainer.tsx";

export default function App() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between max-w-2xl w-full mx-auto">
        <a
          href="/apps/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back
        </a>
        <button
          onClick={() => setShowHelp((h) => !h)}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          How to play
        </button>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        <h1 className="text-4xl font-extrabold text-center mb-1 tracking-tight">
          <span className="text-amber-400">Bracket</span>{" "}
          <span className="text-white">City</span>
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Decode the sentence, one bracket at a time
        </p>

        {showHelp && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 text-sm text-gray-300 space-y-2 animate-slide-up">
            <p>
              <strong className="text-white">Goal:</strong> Fill in every
              bracket to reveal the hidden historical event.
            </p>
            <p>
              <strong className="text-amber-400">Colored brackets</strong> are
              ready to solve — tap one to see its clue.
            </p>
            <p>
              <strong className="text-gray-400">Gray brackets</strong> contain
              unsolved inner brackets — solve those first.
            </p>
            <p>
              Wrong guesses cost <strong className="text-red-400">-10 pts</strong>.
              Hints cost <strong className="text-red-400">-15 pts</strong>.
              Try to keep your score at 100!
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-300 text-xs mt-1"
            >
              Got it
            </button>
          </div>
        )}

        <GameContainer />
      </main>
    </div>
  );
}
