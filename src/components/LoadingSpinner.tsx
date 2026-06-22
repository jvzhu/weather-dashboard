export const LoadingSpinner = ({ label = 'Loading weather data...' }: { label?: string }) => (
  <div className="flex items-center justify-center gap-3 rounded-3xl border border-sky-200/40 bg-white/80 px-6 py-8 text-slate-700 shadow-panel dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" aria-hidden="true" />
    <span className="text-sm font-medium">{label}</span>
  </div>
)
