import { useTheme } from '../context/ThemeContext.tsx'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-sky-400"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
    </button>
  )
}
