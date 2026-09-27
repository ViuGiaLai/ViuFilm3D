const outerMarks = Array.from({ length: 64 }, (_, index) => index);
const innerMarks = Array.from({ length: 24 }, (_, index) => index);
const trigrams = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];

type CultivationSealProps = {
  className?: string;
};

/** A decorative, deterministic SVG so the animation never affects hydration. */
export function CultivationSeal({ className = "" }: CultivationSealProps) {
  return (
    <svg
      className={`cultivation-seal ${className}`.trim()}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <g className="seal-ring seal-ring-outer">
        <circle
          cx="300"
          cy="300"
          r="278"
          className="seal-line seal-line-bright"
        />
        <circle cx="300" cy="300" r="264" className="seal-line" />
        <circle
          cx="300"
          cy="300"
          r="242"
          className="seal-line seal-line-dashed"
        />
        {outerMarks.map((index) => (
          <line
            key={index}
            x1="300"
            y1={index % 4 === 0 ? "34" : "41"}
            x2="300"
            y2={index % 4 === 0 ? "57" : "50"}
            transform={`rotate(${index * (360 / outerMarks.length)} 300 300)`}
            className="seal-mark"
          />
        ))}
      </g>

      <g className="seal-ring seal-ring-middle">
        <circle
          cx="300"
          cy="300"
          r="224"
          className="seal-line seal-line-bright"
        />
        <circle cx="300" cy="300" r="206" className="seal-line" />
        <circle
          cx="300"
          cy="300"
          r="179"
          className="seal-line seal-line-dashed"
        />
        {innerMarks.map((index) => (
          <g
            key={index}
            transform={`rotate(${index * (360 / innerMarks.length)} 300 300)`}
          >
            <path d="M294 82v16m12-16v16m-12-8h12" className="seal-glyph" />
            {index % 2 === 0 && (
              <circle cx="300" cy="112" r="2" className="seal-dot" />
            )}
          </g>
        ))}
      </g>

      <g className="seal-ring seal-ring-inner">
        <circle
          cx="300"
          cy="300"
          r="160"
          className="seal-line seal-line-bright"
        />
        <circle cx="300" cy="300" r="141" className="seal-line" />
        <circle
          cx="300"
          cy="300"
          r="111"
          className="seal-line seal-line-dashed"
        />
        {trigrams.map((symbol, index) => {
          const angle = (index * Math.PI) / 4 - Math.PI / 2;
          return (
            <text
              key={symbol}
              x={300 + Math.cos(angle) * 125}
              y={300 + Math.sin(angle) * 125}
              textAnchor="middle"
              dominantBaseline="central"
              className="seal-trigram"
            >
              {symbol}
            </text>
          );
        })}
      </g>

      <g className="seal-core">
        <circle cx="300" cy="300" r="86" className="seal-line" />
        <circle
          cx="300"
          cy="300"
          r="69"
          className="seal-line seal-line-bright"
        />
        <path
          d="M300 245a55 55 0 1 1 0 110a27.5 27.5 0 1 0 0-55a27.5 27.5 0 1 1 0-55"
          className="seal-yinyang"
        />
        <circle cx="300" cy="272.5" r="5" className="seal-dot" />
        <circle cx="300" cy="327.5" r="5" className="seal-dot" />
        <circle cx="300" cy="300" r="4" className="seal-center" />
      </g>
    </svg>
  );
}
