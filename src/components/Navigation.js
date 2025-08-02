import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navigation">
      <span className="menu-toggle" onClick={toggleMenu}>
        ☰
      </span>
      <ul className={isMenuOpen ? "open" : ""}>
      <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/GLOF-map"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Glacial Lake Map
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/GLOF-data"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Explore Data
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/GLOF-forecast"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Flood Forecasting
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about-research"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            About Research
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;

