export function CitiesBar() {
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="glass rounded-2xl px-5 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
        <span className="text-ink">Bangalore</span>
        <span className="opacity-30">•</span>
        <span className="text-ink">Mysore</span>
        <span className="opacity-30">•</span>
        <span className="text-ink">Bhubaneswar</span>
        <span className="opacity-30">•</span>
        <span>Hyderabad coming soon</span>
      </div>
    </div>
  );
}
