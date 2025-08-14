import React from "react";
import "./ResearchTeam.css";

const teamMembers = [

  {
    id: "Amundson",
    name: "Jason Amundson",
    role: "Geophysicist",
    bio: "Professor of Geophysics at the University of Alaska Southeast whose research explores the complex dynamics at the boundaries of tidewater glaciers—where ice meets the ocean. Amundson earned his Ph.D. in Geophysics studying the iceberg calving dynamics of Jakobshavn Isbræ, Greenland. His international collaborations include visiting researcher appointments at the University of Helsinki, Aalto University, and Hokkaido University.",
    image: `${process.env.PUBLIC_URL}/images/amundson.png`,
    website: "https://uas.alaska.edu/dir/jmamundson.html",
  },
  {
    id: "wolken",
    name: "Gabriel Wolken",
    role: "Geological Scientist",
    bio: "Geological Scientist with the Alaska Division of Geological & Geophysical Surveys, focusing on Alaska’s geologic framework and contributing to regional publications and public outreach.",
    image: `${process.env.PUBLIC_URL}/images/wolken.jpg`,
    website: "https://dggs.alaska.gov/pubs/staff/gjwolken",
  },
  {
    id: "rounce",
    name: "David Rounce",
    role: "Glaciologist",
    bio: "Assistant Professor at Carnegie Mellon University. Leads the CryoTartans research group using computational modeling, remote sensing, and fieldwork to understand glacier, water resource, and hazard responses to climate change. Creator of the open-source PyGEM glacier evolution model and recipient of the IGS Firn Award.",
    image: `${process.env.PUBLIC_URL}/images/rounce.jpeg`,
    website: "https://davidrounce.weebly.com/",
  },
  {
    id: "hood",
    name: "Eran Hood",
    role: "Environmental Scientist",
    bio: "Professor of Environmental Science and Department Chair at University of Alaska Southeast. Researches watershed-scale biogeochemistry, alpine and snow hydrology, and glacier-influenced aquatic systems, while fostering interdisciplinary teaching and bridging Indigenous and Western scientific knowledge.",
    image: `${process.env.PUBLIC_URL}/images/hood.png`,
    website: "https://uas.alaska.edu/dir/ewhood.html",
  },
];

const ResearchTeam = () => {
  return (
    <>
      {/* Research Team Container */}
      <div className="research-team-container">
        <h2 className="team-title">About Research</h2>
        <h3 className="research-subheading">Funded by National Science Foundation</h3>

        <div className="about-research-card">
          <h3>
            Confronting glacier outburst flood hazards to improve glacial flood
            forecasts across northwest North America
          </h3>
          <p>
            Our research focuses on understanding and predicting glacier outburst
            floods—sudden, powerful floods that occur when water trapped by
            glaciers is rapidly released. We combine field observations, satellite
            data, and advanced computer models to study how glaciers store and
            release water. This work helps us assess current and future flood
            hazards as glaciers retreat, identify locations most prone to glacial
            floods across Alaska and western British Columbia, and improve
            forecasting tools to protect communities and infrastructure. We work
            closely with federal and state partners to ensure that the models we
            develop directly support hazard preparedness and effective risk
            communication.
          </p>
        </div>

        <div className="team-cards-container">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              <div className="team-card-image">
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  loading="lazy"
                />
              </div>
              <div className="team-card-info">
                <h4>
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-link"
                    aria-label={`Website of ${member.name}`}
                  >
                    {member.name}
                  </a>
                </h4>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Sources section OUTSIDE the research-team-container */}
      <div className="funding-sources">
        <h3>Funding Sources</h3>
        <ul>
          <li>
            <a
              href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2438778&HistoricalAwards=false"
              target="_blank"
              rel="noopener noreferrer"
            >
              National Science Foundation Integrative and Collaborative Education and Research Award
            </a>
          </li>

        </ul>
      </div>
    </>
  );
};

export default ResearchTeam;
