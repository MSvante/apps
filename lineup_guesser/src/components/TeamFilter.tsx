interface TeamFilterProps {
  teams: string[];
  selected: string | null;
  onChange: (team: string | null) => void;
}

export function TeamFilter({ teams, selected, onChange }: TeamFilterProps) {
  return (
    <div className="flex justify-center">
      <select
        value={selected ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-gray-800 text-gray-200 text-xs sm:text-sm border border-gray-700
          rounded-md px-2 py-1 focus:outline-none focus:border-yellow-500
          transition-colors cursor-pointer"
      >
        <option value="">All teams</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
}
