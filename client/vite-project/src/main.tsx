import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import ProblemRunnerPage from "./pages/ProblemRunner.tsx";
import LandingPage from "./pages/LandingPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/" element={<App />} />
        <Route path="/practice" element={<ProblemRunnerPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
