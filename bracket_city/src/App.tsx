import GameContainer from "./components/GameContainer.tsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 pt-4 pb-2">
        <a
          href="/apps/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Apps
        </a>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="text-amber-400">Bracket</span>{" "}
          <span className="text-white">City</span>
        </h1>
        <GameContainer />
      </main>
    </div>
  );
}
