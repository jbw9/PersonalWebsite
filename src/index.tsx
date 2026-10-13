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
const dark = <div className="min-h-screen bg-[#070b14]" />;

// Old URLs from before the remix became the live site: /v/remix/* moved to the root, /v/<slug> to /archive
const Moved = ({ to }: { to: (p: Record<string, string | undefined>) => string }) => <Navigate to={to(useParams())} replace />;

ReactGA.initialize("G-VN6BJFZWJT");

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
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
