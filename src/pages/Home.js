import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Home.css';
import SBmodel from './SBmodel';

// cd /Users/seanfagan/Desktop/test/Alaska-GLOF

const cardData = [
  {
    title: 'Glacial Lake Map',
    link: '/map',
    image: process.env.PUBLIC_URL + '/images/flood-map.png',
    description:
      'View known & predicted locations of glacial lake outburst floods in Alaska.',
  },
  {
    title: 'Explore Data',
    link: '/data',
    image: process.env.PUBLIC_URL + '/images/flood-events.jpg',
    description:
      'Go deeper into the impacts & data of glacial lake outburst floods.',
  },
  {
    title: 'Glacial Lake Hazards',
    link: '/about-glacial-lakes',
    image: process.env.PUBLIC_URL + '/images/glof-hazard.jpg',
    description:
      'Why glacial dammed lakes are a hazard & how they work (Under development)',
  },
  {
    title: 'Research Team',
    link: '/research-team',
    image: process.env.PUBLIC_URL + '/images/suicide-basin.jpg',
    description:
      'Meet the team & learn more about organizations supporting the research.',
  },
];


const faqData = [
  {
    question: 'What are glacial lake outburst floods (GLOFs)?',
    answer:
      'Glacial lake outburst floods (GLOFs) happen when ice-dammed or moraine-dammed lakes release large volumes of water to downstream river systems.',
  },
  {
    question: 'What is an ice-dammed glacial lake?',
    answer:
      'Ice-dammed lakes form when glacial ice blocks the drainage of rivers or meltwater. These lakes often occur along the margins of mountain and icefield glaciers.',
  },
  {
    question:
      'What if I find an ice-dammed glacial lake that is not listed?',
    answer:
      'Please email us the coordinates or additonal information at UAS-GLOF-info@alaska.edu.',
  },
];

const Home = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const [, setIsMobile] = useState(false);


  const previewFAQCount = 3;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = (e) => setIsMobile(e.matches);
    apply(mq);

    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);


  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };


  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      toggleFAQ(index);
    }
  };

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
This dashboard provides an interactive view of the locations of known glacier-dammed lakes in Alaska, British Columbia, and Yukon. Glacier-dammed lakes can impound large volumes of water, creating the potential for downstream glacier lake outburst floods (GLOFs). In the region, GLOFs pose a threat to infrastructure in communities ranging from the Kenai Peninsula to Valdez and Juneau. Use the cards above to explore the distribution of glacier-dammed lakes in the region and understand how these lakes can lead to the formation of GLOFs.
This website was created by the University of Alaska Southeast in cooperation with the Alaska Climate Adaptation Science Center. Funding for the project was provided by the National Science Foundation & Alaska Climate Adaptation Science Center.

          </p>
        </div>


        <div className="home-about-lake">
          <h3>Ice-Dammed Glacial Lakes</h3>
                    <SBmodel />
          <p>
            Ice-dammed glacial lakes represent a serious flood hazard. These lakes form when glaciers block natural valleys, creating reservoirs that can
            release suddenly. As glaciers retreat more glacial lakes become exposed. To understand how ice-dammed glacial lakes form, function, and the risk they pose, 
            view the Glacial Lakes Hazard page.
          </p>
          <div className= "button-wrapper">           <a
              href="https://www.alaskaglacialfloods.org/#/about-glacial-lakes"
              rel="noopener noreferrer"
              className="home-button"
            >
              More Info
            </a></div>
        </div>

        <div className="home-about-card">
          <h3>Glacial Lake Forecasting</h3>
          <p>
          Over the coming years, our team will work to project the potential formation and locations of ice-dammed glacial lakes across Alaska, British Columbia, & Yukon. This project
          will integrate state-of-the-art glacier evolution models with the latest climate projections to simulate glacier retreat and identify where new glacial lakes are likely to emerge.


          </p>
        </div>

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
