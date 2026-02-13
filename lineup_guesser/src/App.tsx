import { GameContainer } from "./components/GameContainer";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="text-center pt-4 pb-2">
        <h1 className="text-xl font-bold tracking-tight">
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
