import { Clock } from 'lucide-react';

// Sección Resultados: solo informativa, sin datos.
export function Results() {
  return (
    <section aria-labelledby="resultados-titulo" className="border-t border-edge/50">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
        <p className="kicker">Resultados</p>
        <h2 id="resultados-titulo" className="mt-3 font-pixel text-2xl text-primary sm:text-3xl">
          Resultados próximamente
        </h2>
        <Clock size={28} className="mx-auto mt-5 text-secondary" aria-hidden />
        <p className="prose-body mx-auto mt-4 max-w-md">
          Los resultados aparecerán en los próximos días.
        </p>
      </div>
    </section>
  );
}
