import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Weather dashboard crashed', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
          <div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Something went wrong</p>
            <h1 className="mt-3 text-3xl font-semibold">The forecast hit turbulence.</h1>
            <p className="mt-4 text-sm text-slate-300">
              Refresh the page to try again. If the issue persists, check your network connection or reload later.
            </p>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
