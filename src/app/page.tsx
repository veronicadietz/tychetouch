import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="grain min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <header className="max-w-[1400px] mx-auto px-8 lg:px-16 pt-10 flex justify-between items-center">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--forest)' }}>
          TycheTouch
          <span className="mx-3 opacity-40">/</span>
          <span className="opacity-70">by Tyche Digital × VD Advisory</span>
        </div>
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-60">
          A Diagnostic Read
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-8 lg:px-16 pt-20 lg:pt-32 pb-24 relative">
        {/* Floating mark */}
        <div className="absolute top-20 right-8 lg:right-16 opacity-[0.08] pointer-events-none">
          <svg width="420" height="420" viewBox="0 0 100 100" className="rotate-slow">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ color: 'var(--forest)' }} />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ color: 'var(--forest)' }} />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.3" style={{ color: 'var(--forest)' }} />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 50 + 28 * Math.cos(angle);
              const y1 = 50 + 28 * Math.sin(angle);
              const x2 = 50 + 48 * Math.cos(angle);
              const y2 = 50 + 48 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="0.3"
                  style={{ color: 'var(--forest)' }}
                />
              );
            })}
          </svg>
        </div>

        <div className="reveal" style={{ animationDelay: '0.1s' }}>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-8" style={{ color: 'var(--walnut)' }}>
            ❋ Est. 2026 — Volume 01
          </div>
        </div>

        <h1 className="font-display text-[13vw] lg:text-[9rem] leading-[0.88] tracking-[-0.03em] font-light mb-12 reveal" style={{ animationDelay: '0.25s', color: 'var(--ink)' }}>
          The marketing<br />
          <em className="italic font-normal" style={{ color: 'var(--forest)' }}>read</em> no one else<br />
          is giving you.
        </h1>

        <div className="grid lg:grid-cols-12 gap-12 mt-16">
          <div className="lg:col-span-7 lg:col-start-1 reveal" style={{ animationDelay: '0.4s' }}>
            <p className="font-display text-2xl lg:text-3xl leading-[1.35] font-light" style={{ color: 'var(--ink)' }}>
              Most marketing advice treats you like a template. We treat you like a chart.
              Bring your birth data and your offer. We'll show you the pattern underneath
              why your current marketing feels off, and what yours is actually asking for.
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 reveal" style={{ animationDelay: '0.55s' }}>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: 'var(--walnut)' }}>
              What you'll get
            </div>
            <ul className="space-y-4 text-base leading-relaxed">
              <li className="flex gap-3">
                <span className="font-mono text-xs mt-1" style={{ color: 'var(--forest)' }}>01</span>
                <span>A read on your design through a strategic lens, not a mystical one</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs mt-1" style={{ color: 'var(--forest)' }}>02</span>
                <span>The specific misalignment between how you're marketing and how you're wired</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs mt-1" style={{ color: 'var(--forest)' }}>03</span>
                <span>A 90-day orientation shaped to your actual capacity</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs mt-1" style={{ color: 'var(--forest)' }}>04</span>
                <span>The right next move based on your budget and your reality</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row items-start gap-6 reveal" style={{ animationDelay: '0.7s' }}>
          <Link href="/quiz" className="t-button">
            Begin the Read
            <span aria-hidden>→</span>
          </Link>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-60 max-w-xs leading-relaxed pt-4">
            Takes about 5 minutes. Requires birth date, time, and location.
          </div>
        </div>
      </section>

      {/* Divider section */}
      <section className="border-t" style={{ borderColor: 'rgba(108, 81, 56, 0.2)', background: 'var(--linen)' }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-24">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--forest)' }}>
                Why this exists
              </div>
              <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] font-light">
                Marketing that doesn't fit is the most expensive thing a founder can build.
              </h2>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-lg leading-relaxed">
              <p>
                Founder stagnation is almost never an effort problem. It's an orientation
                problem. You are pouring work into a strategy that was built for someone
                with a different design, a different offer, a different nervous system.
              </p>
              <p>
                TycheTouch is the free, diagnostic taste of how we work at Tyche Digital
                Agency and VD Advisory Group. We read who you are, what you sell, and how
                you're actually showing up, and we give you back the pattern you couldn't
                see from inside it.
              </p>
              <p>
                If the read lands, you'll want more. That's the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-8 lg:px-16 py-12 flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <div className="font-display italic text-xl" style={{ color: 'var(--forest)' }}>
            Tyche
          </div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase mt-2 opacity-60">
            A diagnostic by Veronica Dietz
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50 max-w-sm text-right">
          tychedigitalagency.com<br />
          veronicadietz.com
        </div>
      </footer>
    </main>
  );
}
