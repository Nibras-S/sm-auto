export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
        <div className="text-sm">
          The <span className="font-medium text-slate-600">{title}</span> module is scaffolded and
          will be implemented in an upcoming delivery block.
        </div>
        <div className="mt-1 text-xs">See docs/ROADMAP.md for the schedule.</div>
      </div>
    </div>
  );
}
