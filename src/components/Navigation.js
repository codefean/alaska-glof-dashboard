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
            GLOF Map
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/GLOF-forecast"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            GLOF Forecasting
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/GLOF-data"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            GLOF Data
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/research-team"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Research Team
          </NavLink>
        </li>

      </ul>
    </nav>
  );
};

export default Navigation;

