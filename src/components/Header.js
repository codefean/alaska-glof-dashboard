import React from 'react';
import './Header.css';

const Header = () => {
  return (
<header className="header">
  <div className="header-left">
    <a href="https://uas.alaska.edu/" target="_blank" rel="noopener noreferrer">
      <img
        src={`${process.env.PUBLIC_URL}/UAS.png`}
        alt="University of Alaska Southeast Logo"
        className="logo"
      />
    </a>
    <a href="https://cmu.edu/" target="_blank" rel="noopener noreferrer">
      <img
        src={`${process.env.PUBLIC_URL}/CMU.png`}
        alt="Carnegie Mellon University Logo"
        className="logo"
      />
    </a>
  </div>

<div className="header-title">
  {/* Desktop Title */}
  <div className="desktop-title">
    <h1
      onClick={() =>
        (window.location.href = "https://www.alaskaglacialfloods.org")
      }
      style={{ cursor: "pointer" }}
    >
      Alaska
      <span className="plus">
        +
        <span className="plus-tooltip">
          <div className="plus-tooltip-content">
            <p>British Columbia & Yukon</p>
          </div>
        </span>
      </span>{" "}
      Glacial Lake Flood Dashboard
    </h1>
  </div>

  {/* Mobile Title + Subheading */}
  <div className="mobile-title">
    <h1>Alaska Glacial Flood Dashboard</h1>
    <div className="header-subtitle">
    </div>
  </div>
</div>



  <div className="header-right">
    <a href="https://nsf.gov/" target="_blank" rel="noopener noreferrer">
      <img
        src={`${process.env.PUBLIC_URL}/NSF.png`}
        alt="National Science Foundation Logo"
        className="logo"
      />
    </a>
    <a href="https://akcasc.gov/" target="_blank" rel="noopener noreferrer">
      <img
        src={`${process.env.PUBLIC_URL}/ACASC2.png`}
        alt="Alaska Climate Adaptation Science Center Logo"
        className="logo"
      />
    </a>
  </div>
</header>

  );
};

export default Header;
