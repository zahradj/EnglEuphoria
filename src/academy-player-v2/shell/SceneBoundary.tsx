import { Component, type ReactNode } from 'react';

/** Crash guard (concept from the Playground's scene error boundary): a scene that throws shows a calm card with a way on; the lesson goes on. */
export class SceneBoundary extends Component<{ resetKey: string; fallback: (retry: () => void) => ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(prev: { resetKey: string }) { if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false }); }
  render() { return this.state.failed ? this.props.fallback(() => this.setState({ failed: false })) : this.props.children; }
}
