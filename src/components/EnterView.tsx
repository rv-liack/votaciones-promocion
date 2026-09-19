import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { config } from '../config';
import { validateCode } from '../lib/api';
import { formatCodeInput, isValidFormat, normalizeCode } from '../lib/code';
import { session } from '../lib/session';

interface Props {
  onValidated: (code: string) => void;
}

const MESSAGES: Record<string, string> = {
  invalid: 'Código no válido.',
  used: 'Este código ya fue utilizado. Cada código permite una sola votación.',
  rate_limited: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  connect: 'No se pudo conectar. Inténtalo de nuevo.',
};

// Vista "enter": hero + tarjeta centrada con un único input de código.
export function EnterView({ onValidated }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    const code = normalizeCode(value);
    if (!isValidFormat(code)) {
      setError(MESSAGES.invalid);
      return;
    }
    setSending(true);
    setError('');
    try {
      const status = await validateCode(code);
      if (status === 'valid') {
        session.setCode(code);
        onValidated(code);
      } else {
        setError(MESSAGES[status] ?? MESSAGES.invalid);
      }
    } catch {
      setError(MESSAGES.connect);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden />
      <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
        <p className="kicker text-center">{config.heroKicker}</p>
        <h1 className="hero-title mt-3 text-primary">{config.heroTitle}</h1>
        <p className="lede mt-4">{config.heroLede}</p>

        <div className="mx-auto mt-10 max-w-md rounded-lg border border-edge/60 bg-surface-card p-6 hover:bg-surface-hover sm:p-8">
          <div className="flex items-center gap-3">
            <KeyRound size={20} className="text-secondary" aria-hidden />
            <h2 className="font-mono text-sm uppercase tracking-widest text-secondary">
              Ingresa tu código
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="mt-5" noValidate={false}>
            <label htmlFor="code" className="font-mono text-xs uppercase tracking-widest text-muted">
              Código de votación
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="XXXX-XXXX"
              value={value}
              onChange={(e) => setValue(formatCodeInput(e.target.value))}
              maxLength={9}
              className="mt-2 w-full rounded-md border border-edge bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.2em] text-primary placeholder:text-muted"
            />
            <p aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm font-medium text-primary">
              {error}
            </p>
            <button
              type="submit"
              disabled={sending}
              className="mt-2 min-h-[44px] w-full rounded-lg bg-primary px-4 py-2 font-mono text-sm font-medium text-surface hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
            >
              {sending ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
