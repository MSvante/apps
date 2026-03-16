import type { HeadlineResult } from "../types/game.ts"

interface Props {
  wrongCount: number
  result: HeadlineResult | null
}

interface PartProps {
  children: React.ReactNode
  show: boolean
  length: number
}

function AnimatedPart({ children, show, length }: PartProps) {
  if (!show) return null
  return (
    <g
      className="animate-draw-in"
      style={{
        strokeDasharray: length,
        strokeDashoffset: length,
        ["--path-length" as string]: length,
      }}
    >
      {children}
    </g>
  )
}

export default function HangmanDrawing({ wrongCount, result }: Props) {
  const bodyColor = result === "failed" ? "#ef4444" : result === "solved" ? "#059669" : "#6b7280"
  const showPart = (n: number) => wrongCount >= n || result === "failed"

  const wrapperClass = result === "failed"
    ? "animate-shake"
    : result === "solved"
      ? "drop-shadow-[0_0_8px_rgba(5,150,97,0.3)]"
      : ""

  return (
    <div className={`flex justify-center ${wrapperClass}`}>
      <svg viewBox="0 0 200 220" className="w-32 h-32">
        {/* Gallows */}
        <line x1="20" y1="210" x2="80" y2="210" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="210" x2="50" y2="30" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="30" x2="130" y2="30" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
        <line x1="130" y1="30" x2="130" y2="50" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />

        {/* Head */}
        <AnimatedPart show={showPart(1)} length={95}>
          <circle cx="130" cy="65" r="15" stroke={bodyColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        </AnimatedPart>

        {/* Body */}
        <AnimatedPart show={showPart(2)} length={50}>
          <line x1="130" y1="80" x2="130" y2="130" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
        </AnimatedPart>

        {/* Left arm */}
        <AnimatedPart show={showPart(3)} length={32}>
          <line x1="130" y1="95" x2="105" y2="115" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
        </AnimatedPart>

        {/* Right arm */}
        <AnimatedPart show={showPart(4)} length={32}>
          <line x1="130" y1="95" x2="155" y2="115" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
        </AnimatedPart>

        {/* Left leg */}
        <AnimatedPart show={showPart(5)} length={40}>
          <line x1="130" y1="130" x2="110" y2="165" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
        </AnimatedPart>

        {/* Right leg */}
        <AnimatedPart show={showPart(6)} length={40}>
          <line x1="130" y1="130" x2="150" y2="165" stroke={bodyColor} strokeWidth="3" strokeLinecap="round" />
        </AnimatedPart>

        {/* Face (X eyes) on 7th wrong guess */}
        {showPart(7) && result === "failed" && (
          <>
            <line x1="122" y1="58" x2="128" y2="64" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="128" y1="58" x2="122" y2="64" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="132" y1="58" x2="138" y2="64" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="138" y1="58" x2="132" y2="64" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Solved face (smile) */}
        {result === "solved" && (
          <>
            <circle cx="124" cy="61" r="2" fill="#059669" />
            <circle cx="136" cy="61" r="2" fill="#059669" />
            <path d="M 123 70 Q 130 77 137 70" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  )
}
