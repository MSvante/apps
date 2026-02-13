export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Player {
  name: string;
  lastName: string;
  lastNameNormalized: string;
  alternateNames?: string[];
  nationality: string;
  nationalityFlag: string;
  age: number;
  shirtNumber: number;
  position: Position;
}

export interface Lineup {
  formation: string;
  players: Player[];
}

export interface Match {
  id: string;
  date: string;
  season: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  homeLineup: Lineup;
  awayLineup: Lineup;
}
