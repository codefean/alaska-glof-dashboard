import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./styles/App2.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import GLOFmap from "./pages/GLOFmap";
import GLOFmap2 from "./pages/GLOFmap2";
import GLOFForecast from "./pages/GLOFForecast";
import GLOFData from "./pages/GLOFData";
import ResearchTeam from "./pages/ResearchTeam";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import SubmitDataPage from "./pages/feedback";
import StoryMap from "./pages/StoryMap";
import SuicideBasin from "./pages/SuicideBasin";

/* 🔹 Simple page title hook */
const useDocumentTitle = (title) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};

/* 🔹 Page components with titles */
const GLOFMapPage = () => {
  useDocumentTitle("Glacial Lake Map");
  return <GLOFmap />;
};

const GLOFMapPage2 = () => {
  useDocumentTitle("Glacial Lake Map 2");
  return <GLOFmap2 />; // ✅ Standalone map page — will be routed separately
};

const GLOFForecastPage = () => {
  useDocumentTitle("About Glacial Lakes");
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

/* 🔹 Layout for normal pages */
const LayoutWrapper = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      <Header />
      <Navigation />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/GLOF-map" element={<GLOFMapPage />} />
          <Route path="/about-glacial-lakes" element={<GLOFForecastPage />} />
          <Route path="/GLOF-data" element={<GLOFDataPage />} />
          <Route path="/about-research" element={<ResearchTeamPage />} />
          <Route path="/submit-data" element={<SubmitDataWrapper />} />
          <Route path="/story-map" element={<StoryMapPage />} />
          <Route path="/suicide-basin" element={<SuicideBasinPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

/* 🔹 Main App entry */
const App2 = () => {
  return (
    <Router>
      <Routes>
        <Route path="/GLOF-map2" element={<GLOFMapPage2 />} />

        <Route path="/*" element={<LayoutWrapper />} />
      </Routes>
    </Router>
  );
};

export default App2;
