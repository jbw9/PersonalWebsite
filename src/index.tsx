import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import App from "./App";
import ProjectDetail from "./popup/ProjectDetail";
import "./index.css";
import GuideDetail from "./popup/GuideDetails";

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
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
