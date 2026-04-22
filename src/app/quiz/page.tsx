'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface LocationResult {
  display: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface QuizData {
  name: string;
  birthDate: string;
  birthTime: string;
  location: LocationResult | null;
  offer: {
    whatYouSell: string;
    whoItsFor: string;
    pricePoint: string;
  };
  marketing: {
    platforms: string[];
    howTheyMarket: string;
    whatsWorking: string;
    whatsNotWorking: string;
  };
  goals: {
    financialGoal: string;
    budget: string;
  };
}

const STEP_LABELS = ['Birth Data', 'Your Offer', 'Marketing Reality', 'Goals + Budget'];

const PLATFORMS = [
  'Instagram',
  'Threads',
  'LinkedIn',
  'TikTok',
  'YouTube',
  'Podcast',
  'Email list',
  'Blog / SEO',
  'Facebook',
  'Twitter / X',
  'Pinterest',
  'Substack',
  'Referrals only',
  'Not consistently anywhere',
];

const BUDGETS = [
  { value: '0', label: 'Nothing yet. I\'m figuring it out.' },
  { value: '500', label: 'Up to $500. I want a read before I spend more.' },
  { value: '1000', label: '$1,000–$2,500 / month for implementation' },
  { value: '2500', label: '$2,500+ to build the foundation properly' },
  { value: '5000', label: '$5,000+ / month for ongoing strategic support' },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizData>({
    name: '',
    birthDate: '',
    birthTime: '',
    location: null,
    offer: { whatYouSell: '', whoItsFor: '', pricePoint: '' },
    marketing: { platforms: [], howTheyMarket: '', whatsWorking: '', whatsNotWorking: '' },
    goals: { financialGoal: '', budget: '' },
  });

  // Location autocomplete state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3) {
      setLocationResults([]);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationQuery)}`);
        const json = await res.json();
        setLocationResults(json.results || []);
        setLocationOpen(true);
      } catch {
        setLocationResults([]);
      }
    }, 350);
  }, [locationQuery]);

  const canProceed = () => {
    if (step === 0) {
      return (
        data.name.trim().length > 0 &&
        data.birthDate.length > 0 &&
        data.birthTime.length > 0 &&
        data.location !== null
      );
    }
    if (step === 1) {
      return (
        data.offer.whatYouSell.trim().length > 0 &&
        data.offer.whoItsFor.trim().length > 0 &&
        data.offer.pricePoint.trim().length > 0
      );
    }
    if (step === 2) {
      return data.marketing.platforms.length > 0 && data.marketing.howTheyMarket.trim().length > 0;
    }
    if (step === 3) {
      return data.goals.financialGoal.trim().length > 0 && data.goals.budget.length > 0;
    }
    return false;
  };

  const handleSubmit = () => {
    // Stash in sessionStorage and route to result page
    sessionStorage.setItem('tyche-quiz-data', JSON.stringify(data));
    router.push('/result');
  };

  const togglePlatform = (p: string) => {
    setData({
      ...data,
      marketing: {
        ...data.marketing,
        platforms: data.marketing.platforms.includes(p)
          ? data.marketing.platforms.filter((x) => x !== p)
          : [...data.marketing.platforms, p],
      },
    });
  };

  return (
    <main className="grain min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Progress bar */}
      <div className="max-w-[1000px] mx-auto px-8 lg:px-12 pt-10">
        <div className="flex items-center gap-2 mb-2">
          <a href="/" className="font-mono text-[10px] tracking-[0.25em] uppercase hover:underline" style={{ color: 'var(--forest)' }}>
            ← TycheTouch
          </a>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-40">
            / {STEP_LABELS[step]}
          </span>
        </div>
        <div className="flex gap-1 mt-6">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className="h-[2px] transition-all duration-700"
                style={{
                  background: i <= step ? 'var(--forest)' : 'rgba(108, 81, 56, 0.2)',
                }}
              />
              <div
                className="font-mono text-[9px] tracking-[0.2em] uppercase mt-2 transition-opacity"
                style={{
                  opacity: i === step ? 1 : 0.4,
                  color: i === step ? 'var(--forest)' : 'var(--walnut)',
                }}
              >
                0{i + 1} · {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-8 lg:px-12 py-12 lg:py-20">
        <div key={step} className="reveal">
          {step === 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
                Step One · The Chart
              </div>
              <h2 className="font-display text-5xl lg:text-6xl leading-[1.05] font-light mb-4">
                Let's start with <em style={{ color: 'var(--forest)' }}>when and where</em> you arrived.
              </h2>
              <p className="text-lg opacity-70 mb-12 max-w-2xl">
                Birth time matters. If you don't know it exactly, get as close as you can.
                Within 15 minutes is fine. We use this to map your design, not to guess your fortune.
              </p>

              <div className="grid gap-8 max-w-2xl">
                <div>
                  <label className="t-label">First name</label>
                  <input
                    type="text"
                    className="t-input"
                    placeholder="What do you go by?"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="t-label">Birth Date</label>
                    <input
                      type="date"
                      className="t-input"
                      value={data.birthDate}
                      onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="t-label">Birth Time</label>
                    <input
                      type="time"
                      className="t-input"
                      value={data.birthTime}
                      onChange={(e) => setData({ ...data, birthTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="t-label">Birth Location — city, state, country</label>
                  <input
                    type="text"
                    className="t-input"
                    placeholder="Start typing a city"
                    value={data.location ? data.location.display : locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      if (data.location) setData({ ...data, location: null });
                    }}
                    onFocus={() => setLocationOpen(true)}
                    onBlur={() => setTimeout(() => setLocationOpen(false), 200)}
                  />
                  {locationOpen && locationResults.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-2 z-10 max-h-64 overflow-y-auto"
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid rgba(108, 81, 56, 0.3)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      }}
                    >
                      {locationResults.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          className="block w-full text-left px-4 py-3 hover:bg-opacity-50 transition-colors text-sm"
                          style={{ background: 'transparent' }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'rgba(43, 66, 49, 0.06)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                          onClick={() => {
                            setData({ ...data, location: r });
                            setLocationQuery('');
                            setLocationOpen(false);
                          }}
                        >
                          <div>{r.display}</div>
                          <div className="font-mono text-[10px] opacity-50 mt-1">
                            {r.timezone}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
                Step Two · The Offer
              </div>
              <h2 className="font-display text-5xl lg:text-6xl leading-[1.05] font-light mb-4">
                Now tell us <em style={{ color: 'var(--forest)' }}>what you're selling</em>.
              </h2>
              <p className="text-lg opacity-70 mb-12 max-w-2xl">
                Be specific. Vague offers get vague reads. Treat this like you're briefing a
                strategist who's paid to notice what you miss.
              </p>

              <div className="grid gap-8 max-w-2xl">
                <div>
                  <label className="t-label">What you sell</label>
                  <textarea
                    className="t-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                    placeholder="E.g. A 12-week group program for newly-certified doulas who want to build a private practice"
                    value={data.offer.whatYouSell}
                    onChange={(e) =>
                      setData({ ...data, offer: { ...data.offer, whatYouSell: e.target.value } })
                    }
                  />
                </div>

                <div>
                  <label className="t-label">Who it's for</label>
                  <textarea
                    className="t-input"
                    rows={2}
                    style={{ resize: 'vertical' }}
                    placeholder="E.g. Mid-career therapists who are done with insurance panels and want to transition into cash-pay"
                    value={data.offer.whoItsFor}
                    onChange={(e) =>
                      setData({ ...data, offer: { ...data.offer, whoItsFor: e.target.value } })
                    }
                  />
                </div>

                <div>
                  <label className="t-label">Price point</label>
                  <input
                    type="text"
                    className="t-input"
                    placeholder="E.g. $3,500 one-time, or $497/mo, or $97 + $2,000 upsell"
                    value={data.offer.pricePoint}
                    onChange={(e) =>
                      setData({ ...data, offer: { ...data.offer, pricePoint: e.target.value } })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
                Step Three · The Reality
              </div>
              <h2 className="font-display text-5xl lg:text-6xl leading-[1.05] font-light mb-4">
                How are you <em style={{ color: 'var(--forest)' }}>actually marketing</em> right now?
              </h2>
              <p className="text-lg opacity-70 mb-12 max-w-2xl">
                Not the aspirational version. The real one. This is where the diagnostic lives.
              </p>

              <div className="grid gap-8 max-w-3xl">
                <div>
                  <label className="t-label">Platforms you show up on (pick all that apply)</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`t-check ${data.marketing.platforms.includes(p) ? 'selected' : ''}`}
                        onClick={() => togglePlatform(p)}
                      >
                        <span className="t-check-box" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="t-label">How you currently market</label>
                  <textarea
                    className="t-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                    placeholder="E.g. Post on Instagram 3x/week, do a monthly newsletter, run the occasional workshop, hope referrals come through"
                    value={data.marketing.howTheyMarket}
                    onChange={(e) =>
                      setData({
                        ...data,
                        marketing: { ...data.marketing, howTheyMarket: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="t-label">What's working (optional)</label>
                  <textarea
                    className="t-input"
                    rows={2}
                    style={{ resize: 'vertical' }}
                    placeholder="Anything that's consistently bringing in clients or attention"
                    value={data.marketing.whatsWorking}
                    onChange={(e) =>
                      setData({
                        ...data,
                        marketing: { ...data.marketing, whatsWorking: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="t-label">What's not working (optional, but useful)</label>
                  <textarea
                    className="t-input"
                    rows={2}
                    style={{ resize: 'vertical' }}
                    placeholder="Where you've poured effort and gotten silence back"
                    value={data.marketing.whatsNotWorking}
                    onChange={(e) =>
                      setData({
                        ...data,
                        marketing: { ...data.marketing, whatsNotWorking: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--walnut)' }}>
                Step Four · The Target
              </div>
              <h2 className="font-display text-5xl lg:text-6xl leading-[1.05] font-light mb-4">
                Last piece. <em style={{ color: 'var(--forest)' }}>Goals and budget.</em>
              </h2>
              <p className="text-lg opacity-70 mb-12 max-w-2xl">
                We use this to shape what comes next. No pitch-fits. The right recommendation for
                where you actually are.
              </p>

              <div className="grid gap-8 max-w-2xl">
                <div>
                  <label className="t-label">Your 90-day financial goal</label>
                  <input
                    type="text"
                    className="t-input"
                    placeholder="E.g. Fill 8 Direction Sessions, or hit $15k months, or book 3 Residency clients"
                    value={data.goals.financialGoal}
                    onChange={(e) =>
                      setData({ ...data, goals: { ...data.goals, financialGoal: e.target.value } })
                    }
                  />
                </div>

                <div>
                  <label className="t-label">Monthly marketing budget</label>
                  <div className="grid gap-2 mt-4">
                    {BUDGETS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        className={`t-check ${data.goals.budget === b.value ? 'selected' : ''}`}
                        onClick={() => setData({ ...data, goals: { ...data.goals, budget: b.value } })}
                      >
                        <span className="t-check-box" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="mt-16 flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                onClick={() => setStep(step - 1)}
                style={{ color: 'var(--walnut)' }}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                className="t-button"
                disabled={!canProceed()}
                onClick={() => setStep(step + 1)}
              >
                Continue
                <span aria-hidden>→</span>
              </button>
            ) : (
              <button
                type="button"
                className="t-button"
                disabled={!canProceed()}
                onClick={handleSubmit}
              >
                Generate the Read
                <span aria-hidden>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
