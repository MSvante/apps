import type { Match } from "../types/match";

interface MatchHeaderProps {
  match: Match;
  team: "home" | "away";
}

export function MatchHeader({ match, team }: MatchHeaderProps) {
  const guessTeam = team === "home" ? match.homeTeam : match.awayTeam;

  return (
    <div className="text-center mb-4">
      <div className="text-sm text-gray-400 mb-1">
        {match.season} &middot; {match.date}
      </div>
      <div className="flex items-center justify-center gap-3 text-lg">
        <span
          className={
            team === "home" ? "font-bold text-yellow-400" : "text-gray-300"
          }
        >
          {match.homeTeam}
        </span>
        <span className="text-gray-500 font-mono">{match.score}</span>
        <span
          className={
            team === "away" ? "font-bold text-yellow-400" : "text-gray-300"
          }
        >
          {match.awayTeam}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Guess the <span className="text-yellow-400 font-semibold">{guessTeam}</span> starting XI
      </div>
    </div>
  );
}
