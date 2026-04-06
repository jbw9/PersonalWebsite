import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import App from "./App";
import AppNew from "./AppNew";
import ProjectDetail from "./popup/ProjectDetail";
import ProjectDetailNew from "./popup/ProjectDetailNew";
import GuideDetail from "./popup/GuideDetails";
import GuideDetailsNew from "./popup/GuideDetailsNew";
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
        <Route path="/new-design" element={<AppNew />} />
        <Route path="/new-design/project/:id" element={<ProjectDetailNew />} />
        <Route path="/new-design/guide/:id" element={<GuideDetailsNew />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
