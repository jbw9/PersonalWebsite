import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ProjectDetail from "./popup/ProjectDetail";
import "./index.css";
import GuideDetail from "./popup/GuideDetails";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/guide/:id" element={<GuideDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
