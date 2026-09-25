import { useState, type FormEvent } from 'react';
import { BarChart3, Lock, PieChart as PieIcon, TrendingUp, Users, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { validateResultsCode, getResultsData } from '../lib/api';
import { formatCodeInput, normalizeCode, isValidFormat } from '../lib/code';
import type { ResultsData } from '../types';
import { PieChart } from './charts/PieChart';
import { BarChart } from './charts/BarChart';
import { RatingDistribution } from './charts/RatingDistribution';

const PROPOSAL_COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#84cc16'];

export function Results() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<ResultsData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    const normalized = normalizeCode(code);
    if (!isValidFormat(normalized)) {
      setError('Código no válido.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const valid = await validateResultsCode(normalized);
      if (!valid) {
        setError('Código de acceso incorrecto.');
        setSending(false);
        return;
      }
      setUnlocked(true);
      setLoadingData(true);
      const results = await getResultsData();
      setData(results);
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setSending(false);
      setLoadingData(false);
    }
  }

  // ─── Locked state ───
  if (!unlocked) {
    return (
      <section aria-labelledby="resultados-titulo" className="border-t border-edge/50">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="kicker">Resultados</p>
          <h2 id="resultados-titulo" className="mt-3 font-pixel text-2xl text-primary sm:text-3xl">
            Resultados bloqueados
          </h2>
          <Lock size={28} className="mx-auto mt-5 text-secondary" aria-hidden />
          <p className="prose-body mx-auto mt-4 max-w-md">
            Ingresa un código de acceso para ver las estadísticas completas de la votación.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-lg border border-edge/60 bg-surface-card p-6 text-left sm:p-8">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-secondary" aria-hidden />
              <h3 className="font-mono text-sm uppercase tracking-widest text-secondary">
                Código de acceso a resultados
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="mt-5">
              <label htmlFor="results-code" className="font-mono text-xs uppercase tracking-widest text-muted">
                Código de acceso
              </label>
              <input
                id="results-code"
                name="results-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(formatCodeInput(e.target.value))}
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
                {sending ? 'Verificando…' : 'Acceder'}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // ─── Loading state ───
  if (loadingData || !data) {
    return (
      <section className="border-t border-edge/50">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <p className="kicker">Resultados</p>
          <h2 className="mt-3 font-pixel text-2xl text-primary sm:text-3xl">Cargando resultados…</h2>
          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-edge border-t-primary" aria-hidden />
        </div>
      </section>
    );
  }

  const { proposals, total_votes, rating_distribution, code_stats } = data;
  const sorted = [...proposals].sort((a, b) => b.favor_votes - a.favor_votes);

  return (
    <section aria-labelledby="resultados-titulo" className="border-t border-edge/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="kicker text-center">Resultados</p>
        <h2 id="resultados-titulo" className="mt-3 text-center font-pixel text-2xl text-primary sm:text-3xl">
          Estadísticas de la votación
        </h2>

        {/* ─── Tarjetas de resumen ─── */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users size={20} />}
            label="Votos totales"
            value={total_votes}
          />
          <StatCard
            icon={<Ticket size={20} />}
            label="Códigos usados"
            value={`${code_stats.used} / ${code_stats.total}`}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Propuesta ganadora"
            value={sorted[0]?.promotion_name ?? '—'}
            subValue={sorted[0] ? `${sorted[0].favor_votes} votos` : undefined}
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Calificaciones totales"
            value={proposals.reduce((sum, p) => sum + p.ratings_count, 0)}
          />
        </div>

        {/* ─── Gráfico de torta: distribución de votos ─── */}
        <div className="mt-12 rounded-lg border border-edge/60 bg-surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <PieIcon size={20} className="text-secondary" aria-hidden />
            <h3 className="font-pixel text-lg text-primary">Distribución de votos a favor</h3>
          </div>
          <p className="prose-body mt-2">
            Proporción de votos directos que recibió cada propuesta.
          </p>
          <div className="mt-6 flex justify-center">
            <PieChart
              data={sorted.map((p, i) => ({
                label: p.promotion_name,
                value: p.favor_votes,
                color: PROPOSAL_COLORS[i % PROPOSAL_COLORS.length],
              }))}
            />
          </div>
        </div>

        {/* ─── Gráfico de barras: votos a favor ─── */}
        <div className="mt-8 rounded-lg border border-edge/60 bg-surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-secondary" aria-hidden />
            <h3 className="font-pixel text-lg text-primary">Votos a favor por propuesta</h3>
          </div>
          <p className="prose-body mt-2">
            Comparación directa del número de votos que obtuvo cada propuesta.
          </p>
          <div className="mt-6 overflow-x-auto">
            <BarChart
              data={sorted.map((p, i) => ({
                label: p.promotion_name,
                value: p.favor_votes,
                color: PROPOSAL_COLORS[i % PROPOSAL_COLORS.length],
              }))}
              unit=" votos"
            />
          </div>
        </div>

        {/* ─── Gráfico de barras: promedio de calificaciones ─── */}
        <div className="mt-8 rounded-lg border border-edge/60 bg-surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-secondary" aria-hidden />
            <h3 className="font-pixel text-lg text-primary">Promedio de calificaciones</h3>
          </div>
          <p className="prose-body mt-2">
            Promedio de las calificaciones (1 a 10) que recibió cada propuesta.
          </p>
          <div className="mt-6 overflow-x-auto">
            <BarChart
              data={sorted.map((p, i) => ({
                label: p.promotion_name,
                value: p.avg_score ?? 0,
                color: PROPOSAL_COLORS[i % PROPOSAL_COLORS.length],
              }))}
              maxValue={10}
              unit=""
            />
          </div>
        </div>

        {/* ─── Distribución de calificaciones por propuesta ─── */}
        <div className="mt-12">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-secondary" aria-hidden />
            <h3 className="font-pixel text-lg text-primary">Distribución de calificaciones</h3>
          </div>
          <p className="prose-body mt-2">
            Cantidad de calificaciones recibidas en cada puntaje (1 a 10) por propuesta.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((p) => (
              <RatingDistribution key={p.id} proposal={p} distribution={rating_distribution} />
            ))}
          </div>
        </div>

        {/* ─── Tabla detallada ─── */}
        <div className="mt-12 rounded-lg border border-edge/60 bg-surface-card p-6 sm:p-8">
          <h3 className="font-pixel text-lg text-primary">Tabla detallada</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-left font-mono text-xs uppercase tracking-widest text-muted">
                  <th className="pb-3 pr-4">Propuesta</th>
                  <th className="pb-3 pr-4 text-right">Votos a favor</th>
                  <th className="pb-3 pr-4 text-right">Calificaciones</th>
                  <th className="pb-3 pr-4 text-right">Promedio</th>
                  <th className="pb-3 pr-4 text-right">Máx.</th>
                  <th className="pb-3 text-right">Mín.</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={p.id} className="border-b border-edge-subtle last:border-0">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: PROPOSAL_COLORS[i % PROPOSAL_COLORS.length] }} aria-hidden />
                        <span className="text-primary">{p.promotion_name}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-primary">{p.favor_votes}</td>
                    <td className="py-3 pr-4 text-right font-mono text-primary">{p.ratings_count}</td>
                    <td className="py-3 pr-4 text-right font-mono text-primary">{p.avg_score ?? '—'}</td>
                    <td className="py-3 pr-4 text-right font-mono text-secondary">{p.max_score || '—'}</td>
                    <td className="py-3 text-right font-mono text-secondary">{p.min_score || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Estadísticas de códigos ─── */}
        <div className="mt-12 rounded-lg border border-edge/60 bg-surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Ticket size={20} className="text-secondary" aria-hidden />
            <h3 className="font-pixel text-lg text-primary">Códigos de votación</h3>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={<CheckCircle2 size={20} />} label="Usados" value={code_stats.used} />
            <StatCard icon={<XCircle size={20} />} label="Sin usar" value={code_stats.unused} />
            <StatCard icon={<Ticket size={20} />} label="Total" value={code_stats.total} />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-left font-mono text-xs uppercase tracking-widest text-muted">
                  <th className="pb-3 pr-4">Lote</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3 pr-4 text-right">Usados</th>
                  <th className="pb-3 text-right">Sin usar</th>
                </tr>
              </thead>
              <tbody>
                {code_stats.by_batch.map((b) => (
                  <tr key={b.batch} className="border-b border-edge-subtle last:border-0">
                    <td className="py-3 pr-4 capitalize text-primary">{b.batch}</td>
                    <td className="py-3 pr-4 text-right font-mono text-primary">{b.total}</td>
                    <td className="py-3 pr-4 text-right font-mono text-primary">{b.used}</td>
                    <td className="py-3 text-right font-mono text-secondary">{b.total - b.used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string | number; subValue?: string }) {
  return (
    <div className="rounded-lg border border-edge/60 bg-surface-card p-5">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 font-pixel text-xl text-primary">{value}</p>
      {subValue && <p className="mt-1 font-mono text-xs text-secondary">{subValue}</p>}
    </div>
  );
}
