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
import SubmitDataPage from "./pages/feedback";
import StoryMap from "./pages/StoryMap";
import SuicideBasin from "./pages/SuicideBasin";


const useDocumentTitle = (title) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};

const GLOFMapPage = () => {
  useDocumentTitle("Glacial Lake Map");
  return <GLOFmap />;
};

const GLOFForecastPage = () => {
  useDocumentTitle("Glacial Lake Forecasting");
  return <GLOFForecast />;
};

const GLOFDataPage = () => {
  useDocumentTitle("Glacial Lake Data");
  return <GLOFData />;
};

const ResearchTeamPage = () => {
  useDocumentTitle("About Research");
  return <ResearchTeam />;
};

const HomePage = () => {
  useDocumentTitle("Alaska Glacial Lake Dashboard");
  return <Home />;
};

const SubmitDataWrapper = () => {
  useDocumentTitle("Submit Data");
  return <SubmitDataPage />;
};

const StoryMapPage = () => {
  useDocumentTitle("Story Map");
  return <StoryMap />;
};

const SuicideBasinPage = () => {
  useDocumentTitle("Suicide Basin");
  return <SuicideBasin />;
};


const App2 = () => {
  React.useEffect(() => {
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
            <Route path="/about-research" element={<ResearchTeamPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/submit-data" element={<SubmitDataWrapper />} />
            <Route path="/story-map" element={<StoryMapPage />} />
            <Route path="/suicide-basin" element={<SuicideBasinPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App2;
