import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-image">
        <a href="https://uas.alaska.edu/" target="_blank" rel="noopener noreferrer">
          <img
            src={`${process.env.PUBLIC_URL}/UAS.png`}
            alt="University of Alaska Southeast Logo"
            className="logo"
          />
        </a>
      </div>
      <div className="header-title">
        <h1 onClick={() => window.location.href = 'https://codefean.github.io/alaska-glof-dashboard/#/home'} style={{ cursor: 'pointer' }}>
          Alaska Glacial Lake Flood Forcast
        </h1>
      </div>
    </header>
  );
};

export default Header;
