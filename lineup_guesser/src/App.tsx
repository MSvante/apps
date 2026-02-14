import { GameContainer } from "./components/GameContainer";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="text-center pt-2 sm:pt-4 pb-1 sm:pb-2">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">
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
