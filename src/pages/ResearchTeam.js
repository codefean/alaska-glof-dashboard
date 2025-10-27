import React from "react";
import "./ResearchTeam.css";

const teamMembers = [

  {
    id: "Amundson",
    name: "Jason Amundson",
    role: "Geophysicist",
    affiliation: "University of Alaska Southeast",
    bio: "Professor of Geophysics at the University of Alaska Southeast, whose research explores glacier dynamics, glacier hydrology, and glacier-ocean interactions.",
    image: `${process.env.PUBLIC_URL}/images/amundson.png`,
    website: "https://uas.alaska.edu/dir/jmamundson.html",
  },
  {
    id: "wolken",
    name: "Gabriel Wolken",
    role: "Geological Scientist",
    affiliation: "Alaska Division of Geological & Geophysical Surveys",
    bio: "Geological Scientist with the Alaska Division of Geological & Geophysical Surveys, focusing on Alaska’s geologic framework and contributing to regional publications and public outreach.",
    image: `${process.env.PUBLIC_URL}/images/wolken.jpg`,
    website: "https://dggs.alaska.gov/pubs/staff/gjwolken",
  },
  {
    id: "rounce",
    name: "David Rounce",
    role: "Glaciologist",
    affiliation: "Carnegie Mellon University",
    bio: "Assistant Professor of Civil and Environmental Engineering at Carnegie Mellon University, whose research explores glacier projections and glacier outburst floods through the integration of fieldwork, remote sensing, and models.",
    image: `${process.env.PUBLIC_URL}/images/rounce.jpeg`,
    website: "https://davidrounce.weebly.com/",
  },
  {
    id: "hood",
    name: "Eran Hood",
    role: "Environmental Scientist",
    affiliation: "University of Alaska Southeast",
    bio: "Professor of Environmental Science and Department Chair at University of Alaska Southeast. Researches watershed-scale biogeochemistry, alpine and snow hydrology, and glacier-influenced aquatic systems, while fostering interdisciplinary teaching.",
    image: `${process.env.PUBLIC_URL}/images/hood.png`,
    website: "https://uas.alaska.edu/dir/ewhood.html",
  },

  {
    id: "abbruscato",
    name: "Morgan Abbruscato",
    role: "Environmental Scientist",
    affiliation: "Carnegie Mellon University",
    bio: "PhD Student at Carnegie Mellon University in Environmental Engineering whose research explores glacier–lake interactions and their implications for glacier evolution and hazard assessment in a changing climate.",
    image: `${process.env.PUBLIC_URL}/images/abbruscato.jpeg`,
    website: "",
  },
    {
    id: "fagan",
    name: "Sean Fagan",
    role: "Environmental Scientist",
    affiliation: "University of Alaska Southeast",
    bio: "Researcher at University of Alaska Southeast. The lead programmer for the Alaska Glacial Lake Flood Dashboard and Juneau Glacial Flood Dashboard, platforms designed to improve public access to real-time flood risk data and hazard forecasts.",
    image: `${process.env.PUBLIC_URL}/images/sfagan.jpeg`,
    website: "",
  },
    {
    id: "polashenski",
    name: "David Polashenski",
    role: "Glaciologist",
    affiliation: "University of Alaska Fairbanks",
    bio: "David Polashenski is a Post Doctoral Researcher at University of Alaska Fairbanks. He specializes in sea ice geophysics and the interaction of sunlight with ice and snow. His research focuses on understanding how changing ice and snow processes influence climate change.",
    image: `${process.env.PUBLIC_URL}/images/polashenski.jpg`,
    website: "dpolashenski2@alaska.edu",
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
          <p>
            Our research focuses on understanding and predicting glacier outburst
            floods. We combine field observations, satellite
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
                <p className="affiliation-role">{member.affiliation}</p>
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
              <strong>National Science Foundation:</strong> Confronting Hazards Impacts and Risk for a Resilient Planet (CHIRRP)
            </a>
          </li>
           <li>
            <a
              href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2438778&HistoricalAwards=false"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Alaska Climate Adaptation Science Center:</strong> Improving Early Warning Forecasting and Mitigation for Glacier Lake Outburst Floods in Alaska 
            </a>
          </li>

        </ul>
      </div>
    </>
  );
};

export default ResearchTeam;
