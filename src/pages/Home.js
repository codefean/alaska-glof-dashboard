import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Home.css';

// cd /Users/seanfagan/Desktop/Alaska-GLOF

const resourceLinks = [

  {
    title: 'National Weather Service',
    url: 'https://www.weather.gov/safety/flood',
    color: '#1f77b4',
  },
  {
    title: 'State of Alaska',
    url: 'https://ready.alaska.gov/Flood',
    color: '#9467bd',
  },
  {
    title: 'Latest Alaska Weather Alerts',
    url: 'https://alerts-v2.weather.gov/search?area=AK',
    color: '#30964b',
  },
];

const educationLinks = [
  {
    title: 'Story Map: Understand the Mendenhall GLOF',
    url: 'https://storymaps.arcgis.com/stories/72cef125bbfa4f989356bf9350cd5d63',
    color: '#1f77b4',
  },
  {
    title: 'Story Map: How Suicide Basin is Monitored',
    url: 'https://storymaps.arcgis.com/stories/2ad8631c1abb4dfab3ec92b34f27ba8c',
    color: '#1f77b4',
  },
  {
    title: '-',
    url: '-',
    color: '#1f77b4',
  },
];

// Card Data
const cardData = [
  {
    title: 'Glacial Lake Map',
    link: '/GLOF-map',
    image: process.env.PUBLIC_URL + '/images/flood-map.png',
    description:
      'View known & predicted locations of glacial lake outburst floods in Alaska.',
  },
  {
    title: 'Explore Data',
    link: '/GLOF-data',
    image: process.env.PUBLIC_URL + '/images/flood-events.jpg',
    description:
      'Go deeper into the impacts & data of glacial lake outburst floods.',
  },
  {
    title: 'Flood Forecasting',
    link: '/GLOF-forecast',
    image: process.env.PUBLIC_URL + '/images/flood-forecast.jpg',
    description:
      'Learn how forecasting of future glacial lakes is conducted.',
  },
  {
    title: 'About Research',
    link: '/research-team',
    image: process.env.PUBLIC_URL + '/images/suicide-basin.jpg',
    description:
      'Meet the team & learn more about organizations supporting the research.',
  },
];

// FAQ Data
const faqData = [
  {
    question: 'What are glacial lake outburst floods (GLOFs)?',
    answer:
      'Glacial lake outburst floods (GLOFs) happen when ice-dammed or moraine-dammed lakes release large volumes of water to downstream river systems.',
  },
  {
    question: 'What is an ice-dammed glacial lake?',
    answer:
      'An ice-dammed glacial lake forms when meltwater collects behind a glacier, creating a temporary natural dam made of ice.',
  },
  {
    question:
      'What if my property is downstream from an ice-dammed glacial lake?',
    answer:
      '-',
  },
];

const Home = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Adjust based on how many FAQs you want previewed initially
  const previewFAQCount = 3;

  // Handle mobile view detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = (e) => setIsMobile(e.matches);
    apply(mq);

    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Toggle FAQ open/close
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Handle Enter key for accessibility
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      toggleFAQ(index);
    }
  };

  return (
    <div className="home-container">
      {/* Card Grid Section */}
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

      {/* About & FAQ Section */}
      <div className="home-intro">
        {/* About Section */}
        <div className="home-about-card">
          <h3>About</h3>
          <p>
            This dashboard provides an interactive view of the potential
            locations for glacial lake outburst floods in Alaska. Use the cards
            above to explore predicted locations of GLOFs and how forecasting is
            conducted. This website was created by the University of Alaska
            Southeast.
          </p>
        </div>


        {/* FAQ Section */}
        <div className="home-about-card">
          <h3>Frequently Asked Questions</h3>
          {faqData
            .slice(0, showAllFAQs ? faqData.length : previewFAQCount)
            .map((faq, index) => {
              const isPreview =
                !showAllFAQs && index >= previewFAQCount;
              return (
                <div
                  key={index}
                  className={`faq-row ${
                    openIndex === index ? 'open' : ''
                  }`}
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  style={{
                    opacity: isPreview ? 0.7 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  <div className="faq-question">
                    {faq.question}
                    <span
                      className={`faq-toggle-icon ${
                        openIndex === index ? 'rotated' : ''
                      }`}
                    >
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </div>
                  <div
                    id={`faq-answer-${index}`}
                    className={`faq-answer ${
                      openIndex === index ? 'show' : ''
                    }`}
                  >
                    {faq.answer}
                  </div>
                  {index !== faqData.length - 1 && (
                    <hr className="faq-divider" />
                  )}
                </div>
              );
            })}

          {/* Show More / Less Button */}
          {faqData.length > previewFAQCount && (
            <div className="button-wrapper">
              <button
                className="home-button"
                onClick={() => setShowAllFAQs(!showAllFAQs)}
              >
                {showAllFAQs ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </div>

                        <div className="resources-wrapper">
          <div className="home-about-card">
            <h3>Flood Safety Resources</h3>
            <ul className="resource-list">
              {resourceLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                    style={{ borderLeftColor: link.color }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-about-card">
            <h3>Educational Resources</h3>
            <ul className="resource-list">
              {educationLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                    style={{ borderLeftColor: link.color }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Contact Section */}
        <div className="home-about-card">
          <h3>Contact Us</h3>
          <p>
            This dashboard is maintained by the University of Alaska Southeast.
            For questions or comments, please contact:
            <br />
            <strong>UAS-GLOF-info@alaska.edu</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
