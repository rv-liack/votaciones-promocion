import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { EnterView } from './components/EnterView';
import { VoteView } from './components/VoteView';
import { DoneView } from './components/DoneView';
import { Results } from './components/Results';
import { SocialLinks } from './components/SocialLinks';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { session } from './lib/session';
import type { DoneSummary, ViewState } from './types';

// Una sola URL con estado de vista ("enter" | "vote" | "done").
function initialView(): ViewState {
  if (session.getDone()) return 'done';
  if (session.getCode()) return 'vote';
  return 'enter';
}

export function App() {
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<ViewState>(initialView);
  const [code, setCode] = useState<string | null>(() => session.getCode());
  const [summary, setSummary] = useState<DoneSummary | null>(() => session.getDone());

  const handleValidated = useCallback((validCode: string) => {
    setCode(validCode);
    setView('vote');
  }, []);

  const handleExited = useCallback(() => {
    setCode(null);
    setView('enter');
  }, []);

  const handleVoted = useCallback((done: DoneSummary) => {
    setCode(null);
    setSummary(done);
    setView('done');
  }, []);

  return (
    <div className="min-h-screen bg-surface font-sans text-primary">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:border focus:border-edge focus:bg-surface-raised focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-primary"
      >
        Saltar al contenido
      </a>
      <Header theme={theme} onToggleTheme={toggle} />
      <main id="contenido">
        {view === 'enter' && <EnterView onValidated={handleValidated} />}
        {view === 'vote' && code && (
          <VoteView code={code} onExited={handleExited} onVoted={handleVoted} />
        )}
        {view === 'vote' && !code && <EnterView onValidated={handleValidated} />}
        {view === 'done' && summary && <DoneView summary={summary} />}
      </main>
      <Results />
      <SocialLinks />
      <Footer />
    </div>
  );
}
