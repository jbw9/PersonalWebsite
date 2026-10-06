import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutGrid, RotateCcw, X } from "lucide-react";
import { variants } from "./registry";

// "/" (the live site) is stop 0, so you can compare every variant against it
const stops = [{ slug: "", name: "Current site", pitch: "What's live today" }, ...variants];
const pathOf = (slug: string) => (slug ? `/v/${slug}` : "/");

const VariantSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const match = location.pathname.match(/^\/v\/([^/]+)/);
  const onSwitcherPage = location.pathname === "/" || !!match;
  const index = Math.max(0, stops.findIndex((s) => s.slug === (match?.[1] ?? "")));

  const go = (i: number) => {
    setMenuOpen(false);
    navigate(pathOf(stops[(i + stops.length) % stops.length].slug));
  };

  useEffect(() => {
    if (!onSwitcherPage) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "]") go(index + 1);
      if (e.key === "[") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!onSwitcherPage) return null;
  const current = stops[index];

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[2147483000] font-sans"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {menuOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[min(92vw,380px)] max-h-[60vh] overflow-y-auto rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2">
          {stops.map((s, i) => (
            <button
              key={s.slug || "current"}
              onClick={() => go(i)}
              className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${
                i === index ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              <div className="text-sm font-medium text-white">
                <span className="text-white/40 tabular-nums mr-2">{i}</span>
                {s.name}
              </div>
              <div className="text-xs text-white/50 pl-5">{s.pitch}</div>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/10 shadow-2xl p-1 text-white">
        <button onClick={() => go(index - 1)} className="p-2 rounded-full hover:bg-white/15" title="Previous ( [ )">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/15 text-sm whitespace-nowrap"
        >
          {menuOpen ? <X className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
          <span className="tabular-nums text-white/50">
            {index}/{variants.length}
          </span>
          <span className="font-medium">{current.name}</span>
        </button>
        {index > 0 && (
          <button
            onClick={() => navigate(location.pathname, { replace: true })}
            className="p-2 rounded-full hover:bg-white/15"
            title="Replay intro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => go(index + 1)} className="p-2 rounded-full hover:bg-white/15" title="Next ( ] )">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VariantSwitcher;
