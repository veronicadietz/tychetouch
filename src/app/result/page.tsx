'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import emailjs from '@emailjs/browser';

interface QuizData {
  name: string;
  birthDate: string;
  birthTime: string;
  location: {
    display: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  offer: { whatYouSell: string; whoItsFor: string; pricePoint: string };
  marketing: {
    platforms: string[];
    howTheyMarket: string;
    whatsWorking: string;
    whatsNotWorking: string;
  };
  goals: { financialGoal: string; budget: string };
}

interface Chart {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definedCenters: string[];
  undefinedCenters: string[];
  sun: { sign: string; degree: number; gate: number; line: number };
  moon: { sign: string; degree: number; gate: number; line: number };
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
}

interface Read {
  headline: string;
  the_design_read: string;
  why_marketing_feels_off: string;
  what_your_design_wants: string;
  ninety_day_orientation: string;
  the_right_next_step: {
    headline: string;
    recommendation: string;
  };
}

const LOADING_PHRASES = [
  'Mapping your gates and activations',
  'Translating your design into strategy',
  'Cross-referencing your offer against your authority',
  'Writing your read',
];

const EMAILJS_PUBLIC_KEY = 'MJt_zDIq8FCr544zR';
const EMAILJS_SERVICE_ID = 'service_doffj8i';
const EMAILJS_TEMPLATE_ID = 'template_2cgj2kz';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<QuizData | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [read, setRead] = useState<Read | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(0);

  // Email gate state
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('tyche-quiz-data');
    if (!stored) {
      router.push('/quiz');
      return;
    }
    const parsed: QuizData = JSON.parse(stored);
    setData(parsed);
    runPipeline(parsed);
  }, [router]);

  useEffect(() => {
    if (read) return;
    const interval = setInterval(() => {
      setLoadingPhrase((p) => (p + 1) % LOADING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [read]);

  // Once chart + read are ready, show the email gate instead of results
  useEffect(() => {
    if (chart && read && !emailSubmitted) {
      setShowEmailGate(true);
    }
  }, [chart, read]);

  const runPipeline = async (d: QuizData) => {
    try {
      const chartRes = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: d.birthDate,
          birthTime: d.birthTime,
          latitude: d.location.latitude,
          longitude: d.location.longitude,
          timezone: d.location.timezone,
        }),
      });
      if (!chartRes.ok) throw new Error('Chart calculation failed');
      const chartJson = await chartRes.json();
      setChart(chartJson.chart);

      const readRes = await fetch('/api/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart: chartJson.chart,
          offer: d.offer,
          marketing: d.marketing,
          goals: d.goals,
        }),
      });
      if (!readRes.ok) {
        const errJson = await readRes.json();
        throw new Error(errJson.error || 'Read generation failed');
      }
      const readJson = await readRes.json();
      setRead(readJson.read);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('A valid email is required to receive your read.');
      return;
    }

    setEmailSubmitting(true);
    setEmailError('');

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: 'veronica@tychetouch.com',
        from_name: data?.name || 'Unknown',
        from_email: email,
        hd_type: chart?.type || '',
        hd_authority: chart?.authority || '',
        hd_profile: chart?.profile || '',
        sun_sign: chart ? `${chart.sun.sign} ${Math.floor(chart.sun.degree)}°` : '',
        birth_location: data?.location?.display || '',
        offer: data?.offer?.whatYouSell || '',
        budget: data?.goals?.budget || '',
        financial_goal: data?.goals?.financialGoal || '',
      });

      setEmailSubmitted(true);
      setShowEmailGate(false);
    } catch (err) {
      // Still let them through if EmailJS fails — don't block the read
      console.error('EmailJS error:', err);
      setEmailSubmitted(true);
      setShowEmailGate(false);
    } finally {
      setEmailSubmitting(false);
    }
  };

  if (error) {
    return (
      <main className="grain min-h-screen flex items-center justify-center px-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-lg text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
            Something interrupted the read
          </div>
          <h2 className="font-display text-3xl mb-4 font-light">{error}</h2>
          <button className="t-button-ghost mt-6" onClick={() => router.push('/quiz')}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!chart || !read) {
    return <LoadingState phrase={LOADING_PHRASES[loadingPhrase]} chart={chart} />;
  }

  // Email gate — appears after loading, before results
  if (showEmailGate && !emailSubmitted) {
    return (
      <main className="grain min-h-screen flex items-center justify-center px-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-lg w-full">

          {/* Chart preview — gives them a taste */}
          <div
            className="grid grid-cols-2 gap-4 p-6 mb-10"
            style={{ background: 'var(--linen)', border: '1px solid rgba(108, 81, 56, 0.2)' }}
          >
            <ChartStat label="Type" value={chart.type} />
            <ChartStat label="Authority" value={chart.authority} />
            <ChartStat label="Profile" value={chart.profile} />
            <ChartStat label="Sun" value={`${chart.sun.sign} ${Math.floor(chart.sun.degree)}°`} sub={`Gate ${chart.sun.gate}.${chart.sun.line}`} />
          </div>

          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
            Your read is ready, {data?.name}
          </div>

          <h2 className="font-display text-4xl leading-[1.1] font-light mb-4" style={{ color: 'var(--forest)' }}>
            Where should we send<br />
            <em>your diagnostic?</em>
          </h2>

          <p className="text-base leading-relaxed mb-8 opacity-70" style={{ color: 'var(--ink)' }}>
            Drop your email and your read unlocks immediately. No sequence. No spam. Just the occasional signal from Tyche when it's worth your attention.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 font-mono text-[13px] tracking-[0.05em] outline-none transition-all"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid rgba(108, 81, 56, 0.35)',
                  color: 'var(--ink)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--forest)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(108, 81, 56, 0.35)')}
                disabled={emailSubmitting}
                autoFocus
              />
              {emailError && (
                <p className="mt-2 font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#c4500a' }}>
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={emailSubmitting}
              className="w-full px-8 py-4 font-mono text-[11px] tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              style={{ background: 'var(--forest)', color: 'var(--paper)' }}
            >
              {emailSubmitting ? 'One moment...' : 'Unlock my read →'}
            </button>
          </form>

          <p className="mt-5 font-mono text-[9px] tracking-[0.2em] uppercase opacity-40 text-center" style={{ color: 'var(--ink)' }}>
            Tyche Digital Agency · tychedigitalagency.com
          </p>
        </div>
      </main>
    );
  }

  const cta = routeCTA(data!.goals.budget, read);

  return (
    <main className="grain min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Header strip */}
      <header className="max-w-[1200px] mx-auto px-8 lg:px-16 pt-10 flex justify-between items-center">
        <a href="/" className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--forest)' }}>
          ← TycheTouch
        </a>
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
          Read for {data?.name}
        </div>
      </header>

      {/* Chart summary bar */}
      <section className="max-w-[1200px] mx-auto px-8 lg:px-16 pt-16 pb-8">
        <div className="fade-in grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 lg:p-8" style={{ background: 'var(--linen)', border: '1px solid rgba(108, 81, 56, 0.2)' }}>
          <ChartStat label="Type" value={chart.type} />
          <ChartStat label="Authority" value={chart.authority} />
          <ChartStat label="Profile" value={chart.profile} />
          <ChartStat label="Sun" value={`${chart.sun.sign} ${Math.floor(chart.sun.degree)}°`} sub={`Gate ${chart.sun.gate}.${chart.sun.line}`} />
        </div>
      </section>

      {/* Headline */}
      <section className="max-w-[1200px] mx-auto px-8 lg:px-16 pt-8 pb-16">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 reveal" style={{ color: 'var(--walnut)', animationDelay: '0.1s' }}>
          The Diagnostic
        </div>
        <h1 className="font-display text-4xl lg:text-6xl leading-[1.1] font-light max-w-4xl reveal" style={{ animationDelay: '0.2s' }}>
          {read.headline}
        </h1>
      </section>

      <Section number="01" title="Your Design, Read Strategically" body={read.the_design_read} delay="0.3s" />
      <Section number="02" title="Why Your Marketing Feels Off" body={read.why_marketing_feels_off} delay="0.1s" dark />
      <Section number="03" title="What Your Design Actually Wants" body={read.what_your_design_wants} delay="0.1s" />
      <Section number="04" title="Your 90-Day Orientation" body={read.ninety_day_orientation} delay="0.1s" accent />

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-8 lg:px-16 py-24">
        <div className="reveal p-8 lg:p-16" style={{ background: 'var(--forest)', color: 'var(--paper)' }}>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--blush)' }}>
            The Right Next Step
          </div>
          <h2 className="font-display text-3xl lg:text-5xl leading-[1.1] font-light mb-8 max-w-3xl">
            {read.the_right_next_step.headline}
          </h2>
          <div className="max-w-2xl text-lg leading-relaxed space-y-4 mb-10 opacity-95">
            {read.the_right_next_step.recommendation.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-[11px] tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--blush)', color: 'var(--forest)' }}
            >
              {cta.label}
              <span aria-hidden>→</span>
            </a>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-70 max-w-xs leading-relaxed pt-4">
              {cta.note}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-8 lg:px-16 py-12 border-t flex flex-col sm:flex-row justify-between items-start gap-4" style={{ borderColor: 'rgba(108, 81, 56, 0.2)' }}>
        <div className="font-display italic text-xl" style={{ color: 'var(--forest)' }}>
          Tyche
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-50">
          tychedigitalagency.com · veronicadietz.com
        </div>
      </footer>
    </main>
  );
}

function ChartStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.25em] uppercase opacity-60 mb-2" style={{ color: 'var(--walnut)' }}>
        {label}
      </div>
      <div className="font-display text-2xl font-normal leading-none" style={{ color: 'var(--forest)' }}>
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] mt-1 opacity-50">{sub}</div>
      )}
    </div>
  );
}

function Section({ number, title, body, delay, dark, accent }: {
  number: string; title: string; body: string; delay: string; dark?: boolean; accent?: boolean;
}) {
  const background = dark ? 'var(--midnight)' : accent ? 'var(--linen)' : 'transparent';
  const color = dark ? 'var(--paper)' : 'var(--ink)';
  const labelColor = dark ? 'var(--blush)' : 'var(--walnut)';
  const accentColor = dark ? 'var(--blush)' : 'var(--forest)';

  return (
    <section style={{ background, color }}>
      <div className="max-w-[1200px] mx-auto px-8 lg:px-16 py-20 lg:py-28">
        <div className="reveal" style={{ animationDelay: delay }}>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-display italic text-5xl font-light" style={{ color: accentColor }}>{number}</span>
                <span className="h-px flex-1 opacity-30" style={{ background: accentColor }} />
              </div>
              <h3 className="font-display text-3xl lg:text-4xl leading-[1.1] font-light" style={{ color: accentColor }}>
                {title}
              </h3>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 text-lg leading-[1.7] space-y-5">
              {body.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingState({ phrase, chart }: { phrase: string; chart: Chart | null }) {
  return (
    <main className="grain min-h-screen flex items-center justify-center px-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-2xl text-center">
        <div className="mb-12">
          <svg width="140" height="140" viewBox="0 0 100 100" className="rotate-slow inline-block">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--forest)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="var(--forest)" strokeWidth="0.5" opacity="0.6" />
            <circle cx="50" cy="50" r="22" fill="none" stroke="var(--forest)" strokeWidth="0.5" opacity="0.3" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              return (
                <circle key={i} cx={50 + 46 * Math.cos(angle)} cy={50 + 46 * Math.sin(angle)} r="1" fill="var(--forest)" />
              );
            })}
          </svg>
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--walnut)' }}>
          {chart ? 'Phase Two' : 'Phase One'}
        </div>
        <h2 className="font-display text-3xl lg:text-4xl leading-[1.2] font-light mb-10">
          {phrase}
          <span className="pulse-dot" style={{ animationDelay: '0s' }}>.</span>
          <span className="pulse-dot" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="pulse-dot" style={{ animationDelay: '0.4s' }}>.</span>
        </h2>
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
          This takes about 30 seconds
        </div>
      </div>
    </main>
  );
}

function routeCTA(budget: string, read: Read): { url: string; label: string; note: string } {
  if (budget === '0') return { url: 'https://ai.tychedigitalagency.com', label: 'Open the Diagnostic Partner', note: 'Free AI chat tool. Takes your read further.' };
  if (budget === '500') return { url: 'https://veronicadietz.com/direction-session', label: 'Book a Direction Session', note: '60 minutes with Veronica. $500. A read on your load-bearing issue.' };
  if (budget === '1000') return { url: 'https://tychedigitalagency.com/marketing-support', label: 'Explore Tyche Marketing Support', note: 'Ongoing marketing that fits your capacity. $1,000+/mo.' };
  if (budget === '2500') return { url: 'https://tychedigitalagency.com/foundational-build', label: 'Explore a Foundational Build', note: 'The GHL infrastructure your marketing needs. $2,500+.' };
  if (budget === '5000') return { url: 'https://veronicadietz.com/the-residency', label: 'Explore The Residency', note: 'Strategic partnership at scale. $10k virtual, $20k in-person.' };
  return { url: 'https://ai.tychedigitalagency.com', label: 'Open the Diagnostic Partner', note: 'Start with the free read.' };
}
