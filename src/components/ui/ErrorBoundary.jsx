import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    const label = this.props.label || "component";

    return (
      <div
        role="alert"
        className="m-4 p-6 rounded-lg border-2 border-sprawl-bright-red/40 bg-sprawl-bright-red/5"
      >
        <h2 className="font-headline text-lg uppercase tracking-wider text-sprawl-bright-red mb-2">
          System Fault — {label}
        </h2>
        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Something went wrong rendering this section. The rest of the site should still work.
        </p>
        <pre className="font-ui text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-sprawl-deep-blue/60 rounded p-3 overflow-x-auto mb-4">
          {this.state.error?.message || "Unknown error"}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          className="px-4 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase tracking-wider text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }
}
