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
            className={({ isActive }) =>
              isActive ? "secondary active-link" : "secondary"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/map"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Glacial Lake Map
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/data"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Explore Data
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/about-glacial-lakes"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Glacial Lake Hazards
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

