import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TrainSearch from "./pages/Trainsearch";
import Analytics from "./pages/Analytics";
import Recommendation from "./pages/Recommendation";
import CrowdPrediction from "./pages/CrowdPrediction";
import LiveStatus from "./pages/LiveStatus";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/train-search"
            element={<TrainSearch />}
          />

          <Route
            path="/live-status"
            element={<LiveStatus />}
          />

          <Route
            path="/crowd-prediction"
            element={<CrowdPrediction />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/recommendation"
            element={<Recommendation />}
          />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}