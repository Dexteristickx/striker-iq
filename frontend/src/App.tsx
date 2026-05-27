
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-primary">
      <nav className="border-b border-primary-border bg-primary-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent-green flex items-center justify-center font-bold text-primary">S</div>
            <span className="text-xl font-bold tracking-tight text-white">Striker<span className="text-accent-green">IQ</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-white transition-colors text-sm font-semibold">Betslip</button>
            <button className="bg-primary-border px-4 py-2 rounded text-sm font-semibold hover:bg-white hover:text-primary transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      <main>
        <Dashboard />
      </main>
      
      <footer className="border-t border-primary-border mt-20 py-8 text-center text-text-secondary text-sm">
        <p className="mb-2">Predictions are data-driven estimates. Sports outcomes are inherently uncertain. Bet responsibly.</p>
        <p>© 2026 StrikerIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
