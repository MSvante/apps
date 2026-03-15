import { useState, useEffect } from "react";

interface TeamFilterProps {
  teams: string[];
  selected: string | null;
  onChange: (team: string | null) => void;
  minYear: number | null;
  maxYear: number | null;
  onYearRangeChange: (min: number | null, max: number | null) => void;
}

const selectClass =
  "bg-gray-800 text-gray-200 text-xs sm:text-sm border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer";

const inputClass =
  "bg-gray-800 text-gray-200 text-xs sm:text-sm border border-gray-700 rounded-md px-2 py-1 w-16 text-center focus:outline-none focus:border-yellow-500 transition-colors";

function parseYear(value: string): number | null {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1900 || n > 2100) return null;
  return n;
}

export function TeamFilter({
  teams,
  selected,
  onChange,
  minYear,
  maxYear,
  onYearRangeChange,
}: TeamFilterProps) {
  const [minInput, setMinInput] = useState(minYear?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxYear?.toString() ?? "");

  // Sync external state changes
  useEffect(() => {
    setMinInput(minYear?.toString() ?? "");
  }, [minYear]);
  useEffect(() => {
    setMaxInput(maxYear?.toString() ?? "");
  }, [maxYear]);

  const handleMinBlur = () => {
    const parsed = parseYear(minInput);
    if (minInput === "") {
      onYearRangeChange(null, maxYear);
    } else if (parsed !== null) {
      onYearRangeChange(parsed, maxYear);
    } else {
      setMinInput(minYear?.toString() ?? "");
    }
  };

  const handleMaxBlur = () => {
    const parsed = parseYear(maxInput);
    if (maxInput === "") {
      onYearRangeChange(minYear, null);
    } else if (parsed !== null) {
      onYearRangeChange(minYear, parsed);
    } else {
      setMaxInput(maxYear?.toString() ?? "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, onBlur: () => void) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      onBlur();
    }
  };

  return (
    <div className="flex justify-center gap-2 items-center">
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
      <input
        type="text"
        inputMode="numeric"
        placeholder="From"
        value={minInput}
        onChange={(e) => setMinInput(e.target.value)}
        onBlur={handleMinBlur}
        onKeyDown={(e) => handleKeyDown(e, handleMinBlur)}
        className={inputClass}
      />
      <span className="text-gray-500 text-xs">–</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="To"
        value={maxInput}
        onChange={(e) => setMaxInput(e.target.value)}
        onBlur={handleMaxBlur}
        onKeyDown={(e) => handleKeyDown(e, handleMaxBlur)}
        className={inputClass}
      />
    </div>
  );
}
