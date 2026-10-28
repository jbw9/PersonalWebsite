import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route, useLocation, useParams } from "react-router-dom";
import ReactGA from "react-ga4";
import Site from "./site";
import VariantPage from "./archive/VariantPage";
import VariantSwitcher from "./archive/VariantSwitcher";

import "./index.css";

const SiteProject = lazy(() => import("./site/pages/ProjectPage"));
const SiteGuide = lazy(() => import("./site/pages/GuidePage"));
const Stats = lazy(() => import("./site/pages/StatsPage"));
const Wayback = lazy(() => import("./site/wayback"));
const dark = <div className="min-h-screen bg-[#070b14]" />;

// Old URLs from before the remix became the live site: /v/remix/* moved to the root, /v/<slug> to /archive
const Moved = ({ to }: { to: (p: Record<string, string | undefined>) => string }) => <Navigate to={to(useParams())} replace />;

// A refresh deep inside an old version (public/snapshots/) lands here through 404.html; old builds can only
// boot from their own root
const SnapshotRoot = () => {
  const { id, "*": rest } = useParams();
  // only from deeper paths: at the root itself it means the build is missing, and replacing would loop
  useEffect(() => {
    if (rest) window.location.replace(`/snapshots/${id}/`);
  }, [id, rest]);
  return dark;
};

ReactGA.initialize("G-VN6BJFZWJT");

// Self-hosted visit counter (pulse/); skips local dev and Jonathan's own browser (set by opening /stats)
const PULSE = process.env.REACT_APP_PULSE_URL;
let ignored = true;
try {
  ignored = !PULSE || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) || localStorage.getItem("pulse-ignore") === "1";
} catch {}
let firstHit = true;

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
    if (ignored || location.pathname === "/stats") return;
    // text/plain keeps it a simple request (no CORS preflight); the referrer only matters on landing
    fetch(PULSE!, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify({ path: location.pathname, ref: firstHit ? document.referrer : "" }),
      keepalive: true,
    }).catch(() => {});
    firstHit = false;
  }, [location.pathname]);
  return null;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/project/:id" element={<Suspense fallback={dark}><SiteProject /></Suspense>} />
        <Route path="/guide/:id" element={<Suspense fallback={dark}><SiteGuide /></Suspense>} />
        <Route path="/stats" element={<Suspense fallback={dark}><Stats /></Suspense>} />
        <Route path="/wayback" element={<Suspense fallback={dark}><Wayback /></Suspense>} />
        <Route path="/snapshots/:id/*" element={<SnapshotRoot />} />
        <Route path="/archive/:slug" element={<VariantPage />} />
        <Route path="/v/remix" element={<Navigate to="/" replace />} />
        <Route path="/v/remix/project/:id" element={<Moved to={(p) => `/project/${p.id}`} />} />
        <Route path="/v/remix/guide/:id" element={<Moved to={(p) => `/guide/${p.id}`} />} />
        <Route path="/v/:slug" element={<Moved to={(p) => `/archive/${p.slug}`} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <VariantSwitcher />
    </BrowserRouter>
  </React.StrictMode>
);
