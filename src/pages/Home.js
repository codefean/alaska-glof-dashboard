import React from 'react';
import { NavLink } from 'react-router-dom';
import './Home.css';

// cd /Users/seanfagan/Desktop/Alaska-GLOF

// pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA

const cardData = [
  {
    title: 'GLOF Map',
    link: '/GLOF-map',
    image: process.env.PUBLIC_URL + '/images/flood-map.png',
    description: '',
  },
  {
    title: 'GLOF Forecasting',
    link: '/GLOF-forecast',
    image: process.env.PUBLIC_URL + '/images/flood-forecast.jpg',
    description: '',
  },
  {
    title: 'About GLOFs',
    link: '/GLOF-data',
    image: process.env.PUBLIC_URL + '/images/flood-events.jpg',
    description: '',
  },
  {
    title: 'Research Team',
    link: '/research-team',
    image: process.env.PUBLIC_URL + '/images/suicide-basin.jpg',
    description: '',
  },
];





const Home = () => {

  return (
    <div className="home-container">
      
      <div className="card-grid">
        {cardData.map((card, index) => (
          <NavLink to={card.link} key={index} className="card">
            <img src={card.image} alt={card.title} className="card-image" />
            <div className="card-overlay">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
          </NavLink>
        ))}
      </div>
  
      <div className="home-intro">
        <div className="home-about-card">
          <h3>About</h3>
          <p>
            This dashboard provides an interactive view of the potential locations for glacial lake outburst floods in Alaska. Use the cards above to explore predicted locations of GLOFs and how forecasting is conducted.
            This website was created by the University of Alaska Southeast.
          </p>
        </div>

        {/* Contact Section */}
        <div className="home-about-card">
          <h3>Contact Us</h3>
          <p>
            This dashboard is maintained by the University of Alaska Southeast. For questions or comments, please contact:
            <br />
            <strong>UAS-GLOF-info@alaska.edu</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
