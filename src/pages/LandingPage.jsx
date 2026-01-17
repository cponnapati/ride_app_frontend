import React, { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { session } from "../api";
import { canQuote, getStaticMapUrl, getStaticQuotes } from "../utils/pricing";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function scrollToId(id) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TopNav({ onLogin }) {
  return (
    <header className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-7">
            <div className="text-xl font-semibold tracking-tight">RIDE</div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
              <button className="hover:text-white">Ride</button>
              <button className="hover:text-white" onClick={onLogin}>Earn</button>
              <button className="hover:text-white" onClick={onLogin}>Business</button>
              <button className="hover:text-white" onClick={onLogin}>About</button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex rounded-full px-3 py-2 text-sm hover:bg-white/10">EN</button>
            <button className="hidden sm:inline-flex rounded-full px-3 py-2 text-sm hover:bg-white/10">Help</button>
            <button
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-white/10"
              onClick={onLogin}
            >
              Log in
            </button>
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              onClick={onLogin}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SubNav({ active, setActive, onSeePrices }) {
  const Tab = ({ id, label, onClick }) => (
    <button
      className={cx(
        "hover:text-slate-900",
        active === id ? "font-semibold text-slate-900" : "text-slate-600"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-3">
          <div className="text-sm font-semibold text-slate-900">Ride</div>
          <div className="hidden md:flex items-center gap-7 text-sm">
            <Tab id="request" label="Request a ride" onClick={() => setActive("request")} />
            <Tab id="reserve" label="Reserve a ride" onClick={() => { setActive("reserve"); scrollToId("reserve"); }} />
            <Tab id="prices" label="See prices" onClick={onSeePrices} />
            <Tab id="options" label="Explore ride options" onClick={() => { setActive("options"); scrollToId("options"); }} />
            <Tab id="airports" label="Airport rides" onClick={() => { setActive("airports"); scrollToId("airports"); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function CardImage({ title, desc, cta, onClick, img }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <img src={img} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
        {cta ? <div className="mt-3 text-sm font-semibold text-slate-900">{cta} →</div> : null}
      </div>
    </button>
  );
}

function LoginModal({ open, onClose, onContinue }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="px-6 py-5">
          <div className="text-lg font-semibold text-slate-900">Log in to see ride options</div>
          <div className="mt-2 text-sm text-slate-600">
            Please take a moment to quickly log in or sign up so we can show you your ride options.
          </div>

          <button
            className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
            onClick={onContinue}
          >
            Continue
          </button>

          <button
            className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onClose}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  // If authenticated, redirect to dashboard
  const redirectTo = useMemo(() => {
    const me = session.me;
    if (!session.token || !me) return null;
    if (me.role === "RIDER") return "/rider";
    if (me.role === "DRIVER") return "/driver";
    return "/admin";
  }, []);

  const [activeTab, setActiveTab] = useState("request");
  const [city, setCity] = useState("Rio De Janeiro, BR");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [showQuotes, setShowQuotes] = useState(false);
  const [error, setError] = useState("");

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingBookQuote, setPendingBookQuote] = useState(null);

  const quoteState = useMemo(() => {
    if (!canQuote(from, to)) return null;
    return getStaticQuotes({ from, to, currency: "USD" });
  }, [from, to]);

  const mapUrl = useMemo(() => {
    if (!canQuote(from, to)) return null;
    return getStaticMapUrl({ city, from, to, width: 900, height: 720 });
  }, [city, from, to]);

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  const goAuth = () => navigate("/auth");

  function onSeePrices() {
    setError("");
    setActiveTab("prices");
    if (!canQuote(from, to)) {
      setError("Please enter both pickup and dropoff locations.");
      setShowQuotes(false);
      return;
    }
    setShowQuotes(true);
    setTimeout(() => window.scrollTo({ top: 250, behavior: "smooth" }), 50);
  }

  function onBook(quote) {
    // Store selection (so after auth you can use it later)
    sessionStorage.setItem(
      "pending_quote",
      JSON.stringify({
        city,
        from,
        to,
        quote,
        meta: quoteState ? { km: quoteState.km, minutes: quoteState.minutes, surge: quoteState.surge } : null,
        createdAt: Date.now(),
      })
    );
    sessionStorage.setItem("post_auth_redirect", "/rider");

    if (!session.token) {
      setPendingBookQuote(quote);
      setLoginModalOpen(true);
      return;
    }

    // Logged in => go to rider
    navigate("/rider");
  }

  function continueToAuth() {
    setLoginModalOpen(false);
    setPendingBookQuote(null);
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNav onLogin={goAuth} />
      <SubNav active={activeTab} setActive={setActiveTab} onSeePrices={onSeePrices} />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onContinue={continueToAuth}
      />

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">📍</span>
                <span className="font-semibold">{city}</span>
              </div>
              <button
                className="text-sm font-semibold text-slate-900 underline underline-offset-2"
                onClick={() => {
                  const next = prompt("Enter city", city);
                  if (next && next.trim()) setCity(next.trim());
                }}
              >
                Change city
              </button>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
              Request a ride for
              <br className="hidden sm:block" /> now or later
            </h1>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Enjoy a discount on your first trip. <span className="text-emerald-700/70">Terms apply*</span>
            </div>

            <div className="mt-7 max-w-md rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-black/5">
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">●</span>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Pickup location"
                    className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm outline-none focus:border-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">➤</span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">■</span>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Dropoff location"
                    className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-3 pt-1">
                  <button
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
                    onClick={onSeePrices}
                  >
                    See prices
                  </button>
                  <button
                    className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black ring-1 ring-slate-200 hover:bg-slate-50"
                    onClick={() => scrollToId("reserve")}
                  >
                    Schedule for later
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="aspect-square w-full max-w-lg overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
              <img
                src="https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1400&q=80"
                alt="Ride"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </main>

      {/* ✅ PRICES + MAP (Uber-like) */}
      {showQuotes && quoteState ? (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            {/* Left: options */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Choose a ride</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {quoteState.km} km • {quoteState.minutes} min • surge {quoteState.surge}× (static demo)
                  </div>
                </div>
                <button
                  className="text-sm font-semibold text-slate-900 underline underline-offset-2"
                  onClick={() => setShowQuotes(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {quoteState.quotes.map((q) => (
                  <button
                    key={q.key}
                    type="button"
                    onClick={() => onBook(q)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left hover:border-slate-300"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{q.name}</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {q.note} • ETA {q.etaLabel} • Seats {q.seats}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{q.priceLabel}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Clicking a ride option will ask you to log in before booking (if not already logged in).
              </div>
            </div>

            {/* Right: map */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
              {mapUrl ? (
                <img
                  src={mapUrl}
                  alt="Map"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback: if staticmap server blocked, show message
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div style="padding:16px;font-size:14px;color:#334155;background:#fff;height:100%;">Map preview unavailable (network blocked). Pricing still works.</div>';
                    }
                  }}
                />
              ) : (
                <div className="p-6 text-sm text-slate-700 bg-white">
                  Enter pickup and dropoff to preview a map.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Suggestions */}
      <Section id="suggestions" title="Suggestions" subtitle="Popular ways to get moving.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CardImage
            title="Ride"
            desc="Go anywhere. Request a ride, hop in, and go."
            cta="Request now"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            img="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80"
          />
          <CardImage
            title="Reserve"
            desc="Reserve your ride in advance so you can relax."
            cta="Plan for later"
            onClick={() => scrollToId("reserve")}
            img="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80"
          />
          <CardImage
            title="Ride options"
            desc="Compare products like Economy, Comfort, XL, and Premium."
            cta="See options"
            onClick={onSeePrices}
            img="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
          />
          <CardImage
            title="Airport rides"
            desc="Request a ride to and from major airports (demo)."
            cta="Explore"
            onClick={() => scrollToId("airports")}
            img="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
      </Section>

      <Section id="reserve" title="Reserve a ride" subtitle="Demo UI. Booking requires login.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Choose date and time</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-slate-700">Date</label>
                <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="date" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-slate-700">Time</label>
                <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="time" />
              </div>
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
              onClick={goAuth}
              title="Booking requires login"
            >
              Next (login required)
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1400&q=80"
              alt="Reserve"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Section>

      <Section id="options" title="Ride options" subtitle="Choose what works best for you (demo).">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80"
              alt="Options"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Explore options</div>
            <div className="mt-2 text-sm text-slate-600">See static price estimates instantly.</div>
            <button
              className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
              onClick={onSeePrices}
            >
              See prices
            </button>
          </div>
        </div>
      </Section>

      <Section id="airports" title="Airport rides" subtitle="Demo UI. Booking requires login.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
              alt="Airports"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Search airports (demo)</div>
            <input
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Type an airport code (e.g., JFK, LHR)"
            />
            <button
              className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
              onClick={goAuth}
              title="Booking requires login"
            >
              Schedule a ride (login required)
            </button>
          </div>
        </div>
      </Section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="text-lg font-semibold text-slate-900">RIDE</div>
              <div className="mt-2 text-sm text-slate-600">Landing page for your Ride Platform.</div>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="font-semibold text-slate-900">Products</div>
              <button className="text-left text-slate-600 hover:text-slate-900" onClick={() => scrollToId("options")}>Ride</button>
              <button className="text-left text-slate-600 hover:text-slate-900" onClick={() => scrollToId("reserve")}>Reserve</button>
              <button className="text-left text-slate-600 hover:text-slate-900" onClick={() => scrollToId("airports")}>Airports</button>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="font-semibold text-slate-900">Account</div>
              <button className="text-left text-slate-600 hover:text-slate-900" onClick={goAuth}>Log in</button>
              <button className="text-left text-slate-600 hover:text-slate-900" onClick={goAuth}>Sign up</button>
            </div>
          </div>
          <div className="mt-10 text-xs text-slate-500">© {new Date().getFullYear()} RIDE Platform</div>
        </div>
      </footer>
    </div>
  );
}
