export function ExportButton() {
  const onClick = () => window.dispatchEvent(new CustomEvent('stairgen:export'));
  return (
    <button className="sg-btn sg-btn--accent" onClick={onClick}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Eksport GLB</span>
    </button>
  );
}
