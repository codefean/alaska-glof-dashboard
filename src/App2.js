import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App2.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import GLOFmap from "./pages/GLOFmap";
import GLOFForecast from "./pages/GLOFForecast";
import GLOFData from "./pages/GLOFData";
import ResearchTeam from "./pages/ResearchTeam";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { preloadGeojsons } from "./utils/preloadGeojsons";

const useDocumentTitle = (title) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};

// Wrapper components to set the title for each route
const GLOFMapPage = () => {
  useDocumentTitle("GLOF Map");
  return <GLOFmap />;
};

const GLOFForecastPage = () => {
  useDocumentTitle("GLOF Forecasting");
  return <GLOFForecast />;
};

const GLOFDataPage = () => {
  useDocumentTitle("GLOF Data");
  return <GLOFData />;
};

const ResearchTeamPage = () => {
  useDocumentTitle("Research Team");
  return <ResearchTeam />;
};

const HomePage = () => {
  useDocumentTitle("Alaska GLOF Dashboard");
  return <Home />;
};

const App2 = () => {
  React.useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => preloadGeojsons());
    } else {
      setTimeout(() => preloadGeojsons(), 1000);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Header />
        <Navigation />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/GLOF-map" element={<GLOFMapPage />} />
            <Route path="/GLOF-forecast" element={<GLOFForecastPage />} />
            <Route path="/GLOF-data" element={<GLOFDataPage />} />
            <Route path="/research-team" element={<ResearchTeamPage />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App2;
