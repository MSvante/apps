const YEAR_OPTIONS = [2010, 2012, 2014, 2016, 2018, 2020, 2022] as const;

interface TeamFilterProps {
  teams: string[];
  selected: string | null;
  onChange: (team: string | null) => void;
  minYear: number | null;
  onMinYearChange: (year: number | null) => void;
}

const selectClass =
  "bg-gray-800 text-gray-200 text-xs sm:text-sm border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer";

export function TeamFilter({
  teams,
  selected,
  onChange,
  minYear,
  onMinYearChange,
}: TeamFilterProps) {
  return (
    <div className="flex justify-center gap-2">
      <select
        value={selected ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={selectClass}
      >
        <option value="">All teams</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
      <select
        value={minYear ?? ""}
        onChange={(e) =>
          onMinYearChange(e.target.value ? Number(e.target.value) : null)
        }
        className={selectClass}
      >
        <option value="">All years</option>
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            {year}+
          </option>
        ))}
      </select>
    </div>
  );
}
