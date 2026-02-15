import { GameContainer } from "./components/GameContainer";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="relative pt-2 sm:pt-4 pb-1 sm:pb-2">
        <a
          href="../"
          className="absolute left-2 sm:left-4 top-2 sm:top-4 px-2 py-1 text-xs font-medium text-gray-500 border border-gray-700 rounded hover:text-gray-300 hover:border-gray-500 transition-colors"
        >
          &#8592; Menu
        </a>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-center">
          PL Lineup Guesser
        </h1>
      </header>
      <main>
        <GameContainer />
      </main>
    </div>
  );
}

export default App;
