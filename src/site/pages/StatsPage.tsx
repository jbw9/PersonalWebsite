import { FormEvent, useEffect, useState } from "react";

// Hidden page (not linked anywhere): visit counts from the Pulse Lambda, unlocked with the key from pulse/.key
const URL_ = process.env.REACT_APP_PULSE_URL;
type Day = { date: string; views: number; uniques: number };
type Stats = { series: Day[]; paths: Record<string, number>; refs: Record<string, number> };

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};

const sum = (days: Day[], k: "views" | "uniques") => days.reduce((a, d) => a + d[k], 0);
const top = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12);

const List = ({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) => (
  <section className="rounded-2xl border border-[#e6ecf5]/10 p-5">
    <h2 className="rx-mono text-[10.5px] text-[#5b9cff]">{title}</h2>
    {rows.length ? (
      <ul className="mt-3 space-y-1.5 text-[15px]">
        {rows.map(([k, n]) => (
          <li key={k} className="flex justify-between gap-4">
            <span className="truncate text-[#c2cbdb]">{k}</span>
            <span className="tabular-nums text-[#8692a8]">{n}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-3 text-[#5d687c] text-[15px]">{empty}</p>
    )}
  </section>
);

const StatsPage = () => {
  const [key, setKey] = useState(() => store.get("pulse-key"));
  const [draft, setDraft] = useState("");
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  // Opening this page marks the browser as Jonathan's, so his own visits stop being counted
  useEffect(() => store.set("pulse-ignore", "1"), []);

  useEffect(() => {
    if (!key || !URL_) return;
    setError("");
    fetch(`${URL_}?key=${encodeURIComponent(key)}&days=${days}`)
      .then(async (r) => {
        if (r.status === 401) {
          store.set("pulse-key", "");
          setKey("");
          throw new Error("Wrong key");
        }
        if (!r.ok) throw new Error(`Pulse returned ${r.status}`);
        setStats(await r.json());
      })
      .catch((e) => setError(e.message));
  }, [key, days]);

  const unlock = (e: FormEvent) => {
    e.preventDefault();
    store.set("pulse-key", draft.trim());
    setKey(draft.trim());
  };

  const series = stats?.series ?? [];
  const max = Math.max(1, ...series.map((d) => d.views));
  const today = series[series.length - 1];

  return (
    <main className="min-h-screen bg-[#070b14] text-[#e6ecf5] px-4 md:px-8 py-16">
      <div className="mx-auto max-w-[56rem]">
        <h1 className="text-[2.6rem] italic font-light">Visitors</h1>

        {!URL_ && <p className="mt-6 text-[#8692a8]">REACT_APP_PULSE_URL isn't set. Run pulse/deploy.sh, then rebuild.</p>}
        {error && <p className="mt-6 text-[#ff8a8a]">{error}</p>}

        {URL_ && !key && (
          <form onSubmit={unlock} className="mt-8 flex gap-3">
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Stats key"
              className="flex-1 rounded-xl bg-[#0d1424] border border-[#e6ecf5]/10 px-4 py-2.5 outline-none focus:border-[#5b9cff]"
            />
            <button className="rounded-xl bg-[#5b9cff] text-[#070b14] px-5 font-medium">Open</button>
          </form>
        )}

        {stats && (
          <>
            <div className="mt-8 flex gap-2">
              {[7, 30, 90].map((n) => (
                <button
                  key={n}
                  onClick={() => setDays(n)}
                  className={`rx-mono text-[11px] rounded-full px-3 py-1 border ${n === days ? "border-[#5b9cff] text-[#5b9cff]" : "border-[#e6ecf5]/10 text-[#8692a8]"}`}
                >
                  {n}d
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Visitors today", today?.uniques ?? 0],
                ["Views today", today?.views ?? 0],
                [`Visitors · ${days}d`, sum(series, "uniques")],
                [`Views · ${days}d`, sum(series, "views")],
              ].map(([label, n]) => (
                <div key={label} className="rounded-2xl border border-[#e6ecf5]/10 p-4">
                  <div className="rx-mono text-[10px] text-[#8692a8]">{label}</div>
                  <div className="mt-1 text-[2rem] tabular-nums">{n}</div>
                </div>
              ))}
            </div>

            <section className="mt-6 rounded-2xl border border-[#e6ecf5]/10 p-5">
              <div className="flex items-end gap-[2px] h-40">
                {series.map((d) => (
                  <div key={d.date} className="relative flex-1 h-full flex items-end" title={`${d.date}: ${d.uniques} visitors, ${d.views} views`}>
                    <div className="absolute bottom-0 w-full rounded-t-sm bg-[#5b9cff]/25" style={{ height: `${(d.views / max) * 100}%` }} />
                    <div className="relative w-full rounded-t-sm bg-[#5b9cff]" style={{ height: `${(d.uniques / max) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between rx-mono text-[10px] text-[#5d687c]">
                <span>{series[0]?.date}</span>
                <span>solid: visitors · faint: views</span>
                <span>{today?.date}</span>
              </div>
            </section>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              <List title="Top pages" rows={top(stats.paths)} empty="No views yet" />
              <List title="Referrers" rows={top(stats.refs)} empty="No outside referrers yet" />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default StatsPage;
