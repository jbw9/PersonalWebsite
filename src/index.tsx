import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import App from "./App";
import ProjectDetail from "./popup/ProjectDetail";
import GuideDetail from "./popup/GuideDetails";
import VariantPage from "./variants/VariantPage";
import VariantSwitcher from "./variants/VariantSwitcher";

const RemixProject = lazy(() => import("./variants/remix/pages/ProjectPage"));
const RemixGuide = lazy(() => import("./variants/remix/pages/GuidePage"));
const dark = <div className="min-h-screen bg-[#070b14]" />;
import "./index.css";

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
        <Route path="/" element={<App />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/guide/:id" element={<GuideDetail />} />
        <Route path="/v/:slug" element={<VariantPage />} />
        <Route path="/v/remix/project/:id" element={<Suspense fallback={dark}><RemixProject /></Suspense>} />
        <Route path="/v/remix/guide/:id" element={<Suspense fallback={dark}><RemixGuide /></Suspense>} />
      </Routes>
      <VariantSwitcher />
    </BrowserRouter>
  </React.StrictMode>
);
