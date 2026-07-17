import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children?: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="grid min-h-screen place-items-center bg-obsidian px-4 py-16 text-center">
          <div className="max-w-md rounded-sm border border-border bg-surface p-8 shadow-gold">
            <h2 className="font-display text-2xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-4 text-sm text-muted">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="focus-ring mt-6 inline-flex items-center justify-center rounded-sm bg-gold px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gold-bright"
              type="button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
