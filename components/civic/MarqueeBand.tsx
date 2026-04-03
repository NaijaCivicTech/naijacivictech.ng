const WORDS = [
  "eVoting",
  "Politician Tracker",
  "Drug Verification",
  "Budget Watch",
  "Scholarship Finder",
  "Power Outage Map",
  "Contract Transparency",
  "Rep Accountability",
  "Road Reports",
  "FarmPrices",
  "Land Registry",
  "Water Access",
];

export function MarqueeBand() {
  return (
    <div className='relative z-1 overflow-hidden whitespace-nowrap bg-brand py-[11px] font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-paper'>
      <div className='inline-block animate-civic-marquee'>
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className='inline-block'
            {...(copy === 1 ? { "aria-hidden": true as const } : {})}
          >
            {WORDS.map((w) => (
              <span key={`${copy}-${w}`} className='inline-block px-7'>
                <span className='text-paper/65'>{w}</span>
                <span className='text-sun'> ◆ </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
